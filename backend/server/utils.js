import jwt from 'jsonwebtoken';

/**
 * Sets the auth_token cookie on the response with standard options.
 */
export function setAuthCookie(res, user) {
  const token = jwt.sign({ user }, process.env.JWT_TOKEN, { expiresIn: "24h" });
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 86400000,
    sameSite: "strict",
  });
  return token;
}

/**
 * Generic handler for updating a single column on the users table.
 * Covers: theme, font, outgoing_sounds, incoming_sounds, notifications_enabled,
 *         profile_pic_visibility, status_visibility, disappearing_message_period
 */
export function updateUserSetting(pool, column) {
  return async (req, res) => {
    const { user, new_setting } = req.body;

    if (new_setting === undefined || !user) {
      return res.status(400).json({ error: `Missing 'new_setting' or 'user' field` });
    }

    try {
      const resp = await pool.query(
        `UPDATE users SET ${column} = $1 WHERE id = $2 RETURNING *`,
        [new_setting, user]
      );

      if (resp.rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: `${column} updated successfully`, user: resp.rows[0] });
    } catch (err) {
      console.error(`Error updating ${column}:`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

/**
 * Builds the opened_at / closed_at JSONB arrays for a list of user ids.
 */
export function buildTimestampArrays(userIds) {
  const openedAt = userIds.map(id => ({ id, opened_at: null }));
  const closedAt = userIds.map(id => ({ id, closed_at: null }));
  return { openedAt, closedAt };
}

/**
 * Updates a JSONB array element's field where elem->>'id' matches targetId.
 * Used for opened_at and closed_at updates.
 */
export async function updateJsonbTimestamp(pool, { contactId, userId, field, value }) {
  const resp = await pool.query(
    `UPDATE contacts
     SET ${field} = (
       SELECT jsonb_agg(
         CASE
           WHEN elem->>'id' = $1::text
           THEN jsonb_set(elem, '{${field.replace('_at', '_at')}}', to_jsonb($3::text))
           ELSE elem
         END
       )
       FROM jsonb_array_elements(${field}) AS elem
     )
     WHERE id = $2`,
    [userId.toString(), contactId, value]
  );
  return resp;
}

/**
 * Stores a 1-on-1 message in the contacts table, updating the correct
 * last_message_sent_by_* column depending on who the original sender was.
 */
export async function storeDirectMessage(pool, { messageToStore, senderId, recipientId, contactId, timestamp }) {
  const contact = await pool.query("SELECT * FROM contacts WHERE id=$1", [contactId]);
  const originalSender = contact.rows[0].sender_id;

  if (originalSender === senderId) {
    await pool.query(
      `UPDATE contacts
       SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb, last_message_sent_by_sender = $4
       WHERE sender_id = $2 AND contact_id = $3`,
      [JSON.stringify(messageToStore), senderId, recipientId, timestamp]
    );
  } else {
    await pool.query(
      `UPDATE contacts
       SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb, last_message_sent_by_recipient = $4
       WHERE sender_id = $3 AND contact_id = $2`,
      [JSON.stringify(messageToStore), senderId, recipientId, timestamp]
    );
  }
}

/**
 * Sends a message object to a recipient via WebSocket if they are online.
 */
export function sendToRecipient(clients, recipientId, message) {
  const recipientWs = clients.get(recipientId);
  if (recipientWs && recipientWs.readyState === 1 /* WebSocket.OPEN */) {
    recipientWs.send(JSON.stringify(message));
    return true;
  }
  console.log(`Recipient ${recipientId} is not online.`);
  return false;
}

/**
 * Checks if a string is a valid base64-encoded image.
 */
export function isBase64Image(str) {
  try {
    return str.length > 100 && btoa(atob(str)) === str;
  } catch {
    return false;
  }
}
