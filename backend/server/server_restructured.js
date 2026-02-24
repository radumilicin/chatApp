import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import { WebSocketServer } from 'ws'
import url from 'url'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import path from "path";
import { fileURLToPath } from "url";
import {v4 as uuidv4} from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';
import {
  setAuthCookie,
  updateUserSetting,
  buildTimestampArrays,
  updateJsonbTimestamp,
  storeDirectMessage,
  sendToRecipient,
  isBase64Image,
} from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const wss = new WebSocketServer({ port: 8080 });
const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const PORT = 3002;
const JWT_TOKEN = process.env.JWT_TOKEN;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_AUTH_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const pool = new pg.Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PSWD,
  port: 5432,
});

// ─── EMAIL (RESEND) ──────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

const emailRateLimit = new Map();

// ─── AUTH & REGISTRATION ──────────────────────────────────────────────

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get("/verify", (req, res) => {
  const token = req.cookies["auth_token"];
  if (!token) return res.status(401).json({ valid: false, message: "No cookie" });

  try {
    const payload = jwt.verify(token, JWT_TOKEN);
    res.json({ valid: true, user: payload });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password, identityKeyPublic, signedPreKeyPublic, signedPreKeySignature, oneTimePreKeysPublic } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing username, email, or password' });
  }

  if (!identityKeyPublic || !signedPreKeyPublic || !signedPreKeySignature || !oneTimePreKeysPublic) {
    return res.status(400).json({ error: 'Missing required key fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    await pool.query(
      'INSERT INTO users (id, username, email, password_hash, about) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user_id, username, email, hashedPassword, "Hey, there! I am using WhatsDown!"]
    );

    await pool.query(
      'INSERT INTO user_keys (user_id, identity_key_public, signed_prekey_public, signed_prekey_signature, signed_prekey_id) VALUES ($1, $2, $3, $4, $5)',
      [user_id, identityKeyPublic, signedPreKeyPublic, signedPreKeySignature, 1]
    );

    for (const otpk of oneTimePreKeysPublic) {
      await pool.query(
        'INSERT INTO one_time_prekeys (user_id, key_id, public_key) VALUES ($1, $2, $3)',
        [user_id, otpk.keyId, otpk.publicKey]
      );
    }

    // Generate verification code and send email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'DELETE FROM email_verification_codes WHERE email = $1',
      [email]
    );
    await pool.query(
      'INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WalkieTalkieTeam <onboarding@resend.dev>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3B7E9B;">SocialiseIt Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3B7E9B; padding: 16px; background: #f0f0f0; border-radius: 8px; text-align: center;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 16px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    res.status(201).json({ user_id });
  } catch (error) {
    console.error("Registration error:", error.message);
    if (error.code === '23505') {
      res.status(400).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/verify-email-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM email_verification_codes WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const record = result.rows[0];

    // Code expired — delete user and all related data (cascade handles keys/prekeys)
    if (new Date() > new Date(record.expires_at)) {
      await pool.query('DELETE FROM users WHERE email = $1 AND email_verified = false', [email]);
      await pool.query('DELETE FROM email_verification_codes WHERE email = $1', [email]);
      return res.status(410).json({ error: 'Verification code has expired. Please register again.' });
    }

    // Mark user as verified and clean up
    await pool.query('UPDATE users SET email_verified = true WHERE email = $1', [email]);
    await pool.query('DELETE FROM email_verification_codes WHERE email = $1', [email]);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying code:', error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/resend-verification-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check user exists and is not yet verified
    const user = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND email_verified = false',
      [email]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'No pending verification for this email' });
    }

    // Rate limit: 60s cooldown per email
    const lastSent = emailRateLimit.get(email);
    if (lastSent && Date.now() - lastSent < 60000) {
      return res.status(429).json({ error: 'Please wait before requesting another code' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('DELETE FROM email_verification_codes WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'SocialiseIt <onboarding@resend.dev>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3B7E9B;">SocialiseIt Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3B7E9B; padding: 16px; background: #f0f0f0; border-radius: 8px; text-align: center;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 16px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    emailRateLimit.set(email, Date.now());
    res.status(200).json({ message: 'Verification code resent' });
  } catch (error) {
    console.error('Error resending verification code:', error.message);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const result = await pool.query('SELECT * from users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: "This account uses Google sign-in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    setAuthCookie(res, user);
    res.status(200).json({ userId: user.id });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided' });

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const { sub, email, name } = ticket.getPayload();

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2', [sub, email]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [sub, user.id]);
      }
      setAuthCookie(res, user);
      res.status(200).json({ userId: user.id, isNewUser: false });
    } else {
      const user_id = uuidv4();
      const username = name || email.split('@')[0];
      await pool.query(
        'INSERT INTO users (id, username, email, google_id, about) VALUES ($1, $2, $3, $4, $5)',
        [user_id, username, email, sub, "Hey, there! I am using WhatsDown!"]
      );
      setAuthCookie(res, { id: user_id, username, email });
      res.status(201).json({ userId: user_id, isNewUser: true });
    }
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
});

app.post('/register-keys', async (req, res) => {
  const { userId, identityKeyPublic, signedPreKeyPublic, signedPreKeySignature, oneTimePreKeysPublic } = req.body;

  if (!userId || !identityKeyPublic || !signedPreKeyPublic || !signedPreKeySignature || !oneTimePreKeysPublic) {
    return res.status(400).json({ error: 'Missing required key fields' });
  }

  try {
    await pool.query(
      'INSERT INTO user_keys (user_id, identity_key_public, signed_prekey_public, signed_prekey_signature, signed_prekey_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, identityKeyPublic, signedPreKeyPublic, signedPreKeySignature, 1]
    );

    for (const otpk of oneTimePreKeysPublic) {
      await pool.query(
        'INSERT INTO one_time_prekeys (user_id, key_id, public_key) VALUES ($1, $2, $3)',
        [userId, otpk.keyId, otpk.publicKey]
      );
    }

    res.status(201).json({ message: 'Keys registered successfully' });
  } catch (error) {
    console.error("Error registering keys:", error.message);
    res.status(500).json({ error: 'Failed to register keys' });
  }
});

// ─── USERS ────────────────────────────────────────────────────────────

app.get('/users', async (req, res) => {
  try {
    const users = await pool.query("SELECT * from users;");
    res.send(users.rows);
  } catch (err) {
    res.status(500).send('Database error');
  }
});

app.post('/changeUsername', async (req, res) => {
  const { id, new_username } = req.body;
  if (!id || !new_username) return res.sendStatus(400);

  try {
    await pool.query('UPDATE users SET username = $2 WHERE id = $1', [id, new_username]);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post('/changeAbout', async (req, res) => {
  const { id, new_about } = req.body;
  if (!id || !new_about) return res.sendStatus(400);

  try {
    await pool.query('UPDATE users SET about = $2 WHERE id = $1', [id, new_about]);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

// ─── USER SETTINGS (all use the same updateUserSetting helper) ───────

app.post('/changeOutgoingMessageSoundsSetting', updateUserSetting(pool, 'outgoing_sounds'));
app.post('/changeIncomingMessageSoundsSetting',  updateUserSetting(pool, 'incoming_sounds'));
app.post('/changeNotificationsEnabled',          updateUserSetting(pool, 'notifications_enabled'));
app.post('/changeTheme',                         updateUserSetting(pool, 'theme'));
app.post('/changeFont',                          updateUserSetting(pool, 'font'));
app.put('/changeProfilePicVisibility',           updateUserSetting(pool, 'profile_pic_visibility'));
app.put('/changeStatusVisibility',               updateUserSetting(pool, 'status_visibility'));
app.put('/changeDisappearingMessagesPeriod',      updateUserSetting(pool, 'disappearing_message_period'));

// ─── KEYS & ENCRYPTION ───────────────────────────────────────────────

app.get('/api/keys', async (req, res) => {
  const { recipient_id } = req.query;
  if (!recipient_id) return res.status(400).json("Bad request");

  try {
    const resp_keys = await pool.query("SELECT * from user_keys WHERE user_id = $1", [recipient_id]);
    const resp_ot_keys = await pool.query("SELECT * from one_time_prekeys WHERE user_id = $1", [recipient_id]);

    if (resp_keys.rows.length === 0 || resp_ot_keys.rows.length === 0) {
      return res.status(404).json("Recipient not found");
    }

    const k = resp_keys.rows[0];
    res.status(200).json({
      identityKey: k.identity_key_public,
      signedPreKey: {
        key_id: k.signed_prekey_id,
        public_key: k.signed_prekey_public,
        signature: k.signed_prekey_signature,
      },
    });
  } catch (error) {
    res.status(500).json("Error: " + error);
  }
});

app.get('/getRatchetState', async (req, res) => {
  const { user_id, conversation_id } = req.query;
  if (!user_id || !conversation_id) return res.status(400).json("Bad request");

  try {
    const state = await pool.query(
      "SELECT * FROM ratchet_state WHERE user_id = $1 AND conversation_id = $2",
      [user_id, conversation_id]
    );

    if (state.rows.length === 0) {
      return res.status(404).json({ error: "Ratchet state not found" });
    }
    res.json(state.rows[0]);
  } catch (error) {
    console.error('Error fetching ratchet state:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/updateRatchetState', async (req, res) => {
  const {
    user_id, conversation_id, send_message_number, receive_message_number,
    send_chain_key, receive_chain_key, root_key, dh_sending_key,
    dh_receiving_key, previous_sending_chain_length,
  } = req.body;

  if (!user_id || !conversation_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const params = [
    user_id, conversation_id, send_message_number, receive_message_number,
    send_chain_key, receive_chain_key, root_key, dh_sending_key,
    dh_receiving_key, previous_sending_chain_length,
  ];

  try {
    const existing = await pool.query(
      'SELECT id FROM ratchet_state WHERE user_id = $1 AND conversation_id = $2',
      [user_id, conversation_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE ratchet_state SET
          send_message_number = $3, receive_message_number = $4,
          send_chain_key = $5, receive_chain_key = $6, root_key = $7,
          dh_sending_key = $8, dh_receiving_key = $9, previous_sending_chain_length = $10
        WHERE user_id = $1 AND conversation_id = $2`,
        params
      );
    } else {
      await pool.query(
        `INSERT INTO ratchet_state (
          user_id, conversation_id, send_message_number, receive_message_number,
          send_chain_key, receive_chain_key, root_key, dh_sending_key,
          dh_receiving_key, previous_sending_chain_length
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        params
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ratchet state:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── CONTACTS ─────────────────────────────────────────────────────────

app.get('/contacts', async (req, res) => {
  const user_id = req.query.user;
  const contact_id = req.query.contact_id || null;

  if (!user_id) return res.status(404).send("You did not specify a user_id");

  try {
    let contacts;
    if (contact_id) {
      contacts = await pool.query(
        "SELECT * FROM contacts WHERE (sender_id = $1 AND contact_id = $2) OR (sender_id = $2 AND contact_id = $1);",
        [user_id, contact_id]
      );
    } else {
      contacts = await pool.query(
        "SELECT * FROM contacts WHERE sender_id = $1 OR contact_id = $1 OR (is_group = TRUE AND members @> $2::jsonb);",
        [user_id, JSON.stringify([user_id])]
      );
    }
    res.status(200).send(contacts.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/insertContact', async (req, res) => {
  const { sender_id, contact_id } = req.body;
  if (!sender_id || !contact_id) return res.status(400).send("Bad request");

  try {
    const id = uuidv4();
    const { openedAt, closedAt } = buildTimestampArrays([sender_id, contact_id]);

    const result = await pool.query(
      "INSERT INTO contacts (id, sender_id, contact_id, group_pic_id, is_group, opened_at, closed_at) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb) RETURNING *",
      [id, sender_id, contact_id, null, false, JSON.stringify(openedAt), JSON.stringify(closedAt)]
    );

    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error inserting contact:", err);
    res.status(500).send("Internal server error");
  }
});

app.get('/contactsGroup', async (req, res) => {
  const group_id = req.query.group_id || null;
  if (!group_id) return res.status(404).send("You did not specify a group_id");

  try {
    const contacts = await pool.query("SELECT * FROM contacts WHERE id = $1;", [group_id]);
    res.status(200).send(contacts.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/deleteChat', async (req, res) => {
  const { curr_user, contact_id } = req.body;
  if (!curr_user || !contact_id) {
    return res.status(400).send({ error: "Invalid or missing curr_user or contact_id parameters" });
  }

  try {
    await pool.query('DELETE FROM contacts WHERE sender_id=$1 AND contact_id=$2', [curr_user, contact_id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error deleting chat:", err.message);
    res.sendStatus(500);
  }
});

app.put('/blockContact', async (req, res) => {
  const { id_contact, action_by, status } = req.body;
  if (!id_contact || !action_by || !status) {
    return res.status(400).send({ error: "Invalid or missing parameters" });
  }

  const isBlocking = status === "block";
  const column = action_by === "sender" ? "blocked_by_sender" : "blocked_by_receiver";
  const timestampCol = action_by === "sender" ? "blocked_by_sender_at" : "blocked_by_receiver_at";
  const timestamp = isBlocking ? new Date().toISOString() : null;

  try {
    await pool.query(
      `UPDATE contacts SET ${column} = $2, ${timestampCol} = $3 WHERE id = $1`,
      [id_contact, isBlocking, timestamp]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error blocking contact:", err.message);
    res.sendStatus(500);
  }
});

// ─── MESSAGES ─────────────────────────────────────────────────────────

app.put('/updateMessageStatus', async (req, res) => {
  const { user_id, contact_id, timestamp, status } = req.body;
  if (!user_id || !contact_id || !timestamp || !status) {
    return res.status(400).json("Bad request");
  }

  try {
    const resp = await pool.query(
      `UPDATE contacts
       SET message = (
         SELECT jsonb_agg(
           CASE
             WHEN elem->>'timestamp' = $3
             THEN jsonb_set(elem, '{status}', to_jsonb($4::text))
             ELSE elem
           END
         )
         FROM jsonb_array_elements(message) elem
       )
       WHERE (sender_id = $1 AND contact_id = $2)
          OR (sender_id = $2 AND contact_id = $1)`,
      [user_id, contact_id, timestamp, status]
    );

    if (resp.rowCount === 0) return res.status(404).json("Contact not found");

    const contact_req = await pool.query(
      "SELECT * FROM contacts WHERE (sender_id = $1 AND contact_id = $2) OR (sender_id = $2 AND contact_id = $1)",
      [user_id, contact_id]
    );
    const contact = contact_req.rows[0];
    const timestamp_read = new Date();

    if (user_id === contact.sender_id) {
      await pool.query(
        "UPDATE contacts SET last_message_read_by_sender = $1 WHERE sender_id = $2 AND contact_id = $3",
        [timestamp_read, user_id, contact_id]
      );
    } else {
      await pool.query(
        "UPDATE contacts SET last_message_read_by_recipient = $1 WHERE sender_id = $3 AND contact_id = $2",
        [timestamp_read, user_id, contact_id]
      );
    }

    res.status(200).json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error: " + error.message);
  }
});

app.put('/accessedChat', async (req, res) => {
  const { curr_user, contact, accessed_at} = req.body;
  if (!curr_user || !contact || !accessed_at) {
    return res.status(400).json({ error: "Missing request parameters" });
  }

  try {
    const resp = await updateJsonbTimestamp(pool, {
      contactId: contact.id,
      userId: curr_user,
      field: "opened_at",
      value: accessed_at,
    });

    if (resp.rowCount === 0) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Error updating access time:`, err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/closeChat', async (req, res) => {
  const { curr_user, contact, exited_at } = req.body;
  if (!curr_user || !contact || !exited_at) {
    return res.status(400).json({ error: "Missing request parameters" });
  }

  try {
    const resp = await updateJsonbTimestamp(pool, {
      contactId: contact.id,
      userId: curr_user,
      field: 'closed_at',
      value: exited_at,
    });

    if (resp.rowCount === 0) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Error updating close time:`, err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GROUPS ───────────────────────────────────────────────────────────

app.post('/createGroup', async (req, res) => {
  const { admin, users, group_name, description, image } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).send({ error: "Invalid 'users' array" });
  }

  try {
    const groups_w_name = await pool.query('SELECT * from contacts WHERE group_name=$1', [group_name]);
    if (groups_w_name.rows.length > 0) return res.sendStatus(409);

    const rdm = uuidv4();
    const id_img = Math.floor(Math.random() * 10000000) + 5;
    const image_data = image || "";

    await pool.query(
      "INSERT INTO images (id, user_id, contact_id, image_name, data) VALUES ($1, $2, $3, $4, $5)",
      [id_img, null, null, "", image_data]
    );

    const { openedAt, closedAt } = buildTimestampArrays(users);

    await pool.query(
      `INSERT INTO contacts (id, group_name, is_group, sender_id, contact_id, members, admins, group_description, group_pic_id, opened_at, closed_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10::jsonb, $11::jsonb)`,
      [rdm, group_name, true, null, null, JSON.stringify(users), JSON.stringify([admin]), description, id_img, JSON.stringify(openedAt), JSON.stringify(closedAt)]
    );

    const insertedGroup = await pool.query('SELECT * FROM contacts WHERE id = $1', [rdm]);
    res.status(200).json({ data: insertedGroup.rows[0] });
  } catch (err) {
    console.error("Error creating group:", err.message);
    res.sendStatus(500);
  }
});

app.post('/exitGroup', async (req, res) => {
  const { curr_user, group_id } = req.body;
  if (!curr_user || !group_id) {
    return res.status(400).send({ error: "Invalid or missing curr_user or group_id parameters" });
  }

  try {
    await pool.query(
      `UPDATE contacts
       SET members = COALESCE(
         (SELECT jsonb_agg(elem) FROM jsonb_array_elements(members) AS elem WHERE elem <> to_jsonb($1::text)),
         '[]'::jsonb
       ),
       admins = COALESCE(
         (SELECT jsonb_agg(elem) FROM jsonb_array_elements(admins) AS elem WHERE elem <> to_jsonb($1::text)),
         '[]'::jsonb
       )
       WHERE is_group = true AND id = $2 AND members ? $1;`,
      [curr_user, group_id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error exiting group:", err.message);
    res.sendStatus(500);
  }
});

app.post('/makeAdmin', async (req, res) => {
  const { userToAddAsAdmin, group_id, admins } = req.body;
  if (!userToAddAsAdmin) return res.status(400).send("Missing user to add as admin");
  if (!group_id) return res.status(400).send("Missing group_id");

  try {
    const new_admins = [...admins, userToAddAsAdmin];
    await pool.query('UPDATE contacts SET admins = $1 WHERE id = $2', [JSON.stringify(new_admins), group_id]);
    res.status(200).json({ success: true, admins: new_admins });
  } catch (error) {
    res.status(500).send(JSON.stringify(error));
  }
});

app.post('/changeGroupName', async (req, res) => {
  const { id, newName } = req.body;
  if (!id || !newName) return res.sendStatus(400);

  try {
    await pool.query('UPDATE contacts SET group_name = $2 WHERE id = $1', [id, newName]);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post('/changeGroupDescription', async (req, res) => {
  const { group_id, description } = req.body;
  if (!group_id || !description) return res.sendStatus(400);

  try {
    await pool.query('UPDATE contacts SET group_description = $2 WHERE id = $1', [group_id, description]);
    res.status(200).send("Group description changed");
  } catch (err) {
    res.status(400).send("Bad request. The request doesn't contain the right parameters.");
  }
});

app.post('/insertMembersInGroup', async (req, res) => {
  const { members, group_id } = req.body;
  const members_ids = members.map(m => m.id);

  if (!group_id || members_ids.length === 0) return res.sendStatus(400);

  try {
    await pool.query(
      `UPDATE contacts SET members = (COALESCE(members, '[]'::jsonb) || $2::jsonb) WHERE id = $1`,
      [group_id, JSON.stringify(members_ids)]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error adding members:", err.message);
    res.sendStatus(500);
  }
});

// ─── IMAGES & PROFILE PICS ───────────────────────────────────────────

app.get('/images', async (req, res) => {
  try {
    const images = await pool.query("SELECT * FROM images;");
    res.status(200).send(images.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/putProfilePic', async (req, res) => {
  const isGroup = req.body.hasOwnProperty('group_id');
  const { data_img, profile_pic_id } = req.body;

  if (!profile_pic_id) return res.status(400).send("Bad request. Missing profile_pic_id.");

  try {
    if (isGroup) {
      const { group_id } = req.body;
      if (!group_id) return res.status(400).send("Bad request. Missing group_id.");

      await pool.query('INSERT INTO images (id, image_name, data) VALUES ($1, $2, $3)', [profile_pic_id, '', data_img]);
      await pool.query('UPDATE contacts SET group_pic_id = $2 WHERE id = $1', [group_id, profile_pic_id]);
    } else {
      const { id } = req.body;
      if (!id) return res.status(400).send("Bad request. Missing user id.");

      await pool.query('INSERT INTO images (id, user_id, image_name, data) VALUES ($1, $2, $3, $4)', [profile_pic_id, id, '', data_img]);
      await pool.query('UPDATE users SET profile_pic_id = $2 WHERE id = $1', [id, profile_pic_id]);
    }
    res.status(200).send("Profile picture changed");
  } catch (error) {
    res.status(500).send("Server error. Image not put in the database.");
  }
});

// ─── WEBSOCKET ────────────────────────────────────────────────────────

const clients = new Map();

wss.on('connection', (ws, req) => {
  const queryObject = url.parse(req.url, true).query;
  const userId = queryObject.userId;
  clients.set(userId, ws);

  ws.on('message', async (MSG) => {
    try {
      const parsedMessage = JSON.parse(MSG);

      if (parsedMessage.hasOwnProperty("group_id")) {
        await handleGroupMessage(ws, parsedMessage);
      } else {
        await handleDirectMessage(ws, parsedMessage);
      }
    } catch (err) {
      console.error('Error handling message:', err);
      ws.send(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  ws.on('close', () => {
    clients.delete(userId);
  });
});

async function handleGroupMessage(ws, parsedMessage) {
  const { sender_id, recipient_ids, group_id, timestamp } = parsedMessage;
  let { message } = parsedMessage;

  if (!sender_id || !recipient_ids || !group_id || !message || !timestamp) {
    ws.send(JSON.stringify({ error: 'Invalid message format' }));
    return;
  }

  // Forward to online recipients
  for (const recipient_id of recipient_ids) {
    sendToRecipient(clients, recipient_id, parsedMessage);
  }

  let imgBytes = null;
  const originalMessage = message;

  if (isBase64Image(message)) {
    try {
      imgBytes = atob(message);
      message = { image_id: Math.floor(Math.random() * 10000000) + 5 };
    } catch (err) {
      console.error("Error decoding image:", err);
    }
  }

  const messageJson = { sender_id, recipient_ids, group_id, message, timestamp };

  try {
    await pool.query(
      `UPDATE contacts SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb WHERE id = $2`,
      [JSON.stringify(messageJson), group_id]
    );
  } catch (err) {
    console.error("Error updating contacts:", err);
  }

  if (imgBytes !== null) {
    try {
      await pool.query(
        'INSERT INTO images (id, user_id, image_name, data) VALUES ($1, $2, $3, $4)',
        [message.image_id, sender_id, '', originalMessage]
      );
    } catch (err) {
      console.error("Could not insert image:", err);
    }
  }

  ws.send(JSON.stringify({ type: 'ack', message: 'Message saved' }));
}

async function handleDirectMessage(ws, parsedMessage) {
  const {
    sender_id, recipient_id, contact_id, ephemeralPublicKey, identityKey,
    oneTimePreKeyId, ciphertext, ciphertext_sender, header, timestamp,
  } = parsedMessage;

  if (!sender_id || !recipient_id || !timestamp || !ciphertext || !ciphertext_sender) {
    ws.send(JSON.stringify({ error: 'Invalid message format' }));
    return;
  }

  const isFirstMessage = !!ephemeralPublicKey;

  const messageToStore = {
    sender_id,
    recipient_id,
    contact_id,
    message: "",
    ciphertext,
    ciphertext_sender,
    header: isFirstMessage ? JSON.stringify(header) : header,
    timestamp,
    is_first_message: isFirstMessage,
    ...(isFirstMessage && { ephemeralPublicKey, identityKey, oneTimePreKeyId }),
  };

  // Forward to recipient if online
  sendToRecipient(clients, recipient_id, messageToStore);

  // Persist to DB
  await storeDirectMessage(pool, {
    messageToStore,
    senderId: sender_id,
    recipientId: recipient_id,
    contactId: contact_id,
    timestamp,
  });

  ws.send(JSON.stringify({ type: 'ack', message: 'Message saved' }));
}

// ─── START SERVER ─────────────────────────────────────────────────────

app.listen(PORT, (error) => {
  if (!error) console.log("Server running on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
