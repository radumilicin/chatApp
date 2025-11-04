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
import { access } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// console.log("password = " + process.env.DATABASE_PSWD)
const wss = new WebSocketServer({ port: 8080 });

const app = express();

app.use(cors(
  {
    origin: "http://localhost:3000",
    credentials: true
  }
))
app.use(express.json({ limit: '10mb' })); // Adjust limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const PORT = 3002;

const JWT_TOKEN = process.env.JWT_TOKEN

// Database configuration
const pool = new pg.Pool({
  user: 'postgres',       // Replace with your PostgreSQL username
  host: 'localhost',           // Replace with your database host
  database: 'chatapp',   // Replace with your database name
  password: process.env.DATABASE_PSWD,   // Replace with your PostgreSQL password
  port: 5432,                  // Replace with your database port (default: 5432)
});

// Middleware to parse JSON
app.use(express.json());

app.get('/users', async (req,res) => {
    try{
        const users = await pool.query("SELECT * from users;");
        res.send(users.rows)
    } catch (err) {
        res.status(500).send('Database error')
    }
});

////////////////////////////////////////////////////////////
//          USER AUTHENTICATION AND REGISTRATION          //
////////////////////////////////////////////////////////////

// Middleware for authentication
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
  
  console.log("In verify endpoint")

  const token = req.cookies["auth_token"];
  if (!token) return res.status(401).json({ valid: false, message: "No cookie" });

  console.log(`token: ${token}`)

  try {
    const payload = jwt.verify(token, JWT_TOKEN);
    res.json({ valid: true, user: payload });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log("username = " + username + ";  password register = " + password)
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    console.log("before query")
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, about) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, "Hey, there! I am using WhatsDown!"]
    );
    console.log("After query")
    res.status(201).json({ userId: result.rows[0].id });
  } catch (error) {
    console.error("More detailed error: " + error.message)
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/login', async (req, res) => {

  console.log("In login endpoint")

  const { username, password } = req.body;

  console.log("username = " + username + ";  password login = " + password);

  try {
    console.log("before query");
    const result = await pool.query(
      'SELECT * from users WHERE username = $1',
      [username]
    );

    console.log("result query = " + JSON.stringify(result));

    if (result.rows.length > 0) {
      const user = result.rows[0];
      // console.log("username = " + username + ";  password login = " + JSON.stringify(await bcrypt.hash(password, 10)));
      // console.log("user = " + JSON.stringify(user))
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      // console.log("password valid = " + isPasswordValid)

      if (isPasswordValid) {
        
        console.log("Password is valid, making and incorporating the token")

        const token = jwt.sign({user}, JWT_TOKEN, { expiresIn: "24h" })
        res.cookie("auth_token", token, {
          httpOnly: true, 
          // secure : process.env.NODE_ENV === "production",
          secure: false,
          maxAge: 3600000,
          sameSite: "strict",
        });
        
        console.log("After cookie incorporation in the response")

        res.status(200).json({ userId: user.id });
      } else {
        res.status(401).json({ error: "Invalid username or password" });
      }
    } else {
      res.status(404).json({ error: "User does not exist" });
    }
  } catch (error) {
    console.error("More detailed error: " + error.message);
    res.status(400).json({ error: 'An error occurred while logging in' });
  }
});

app.get('/logout', (req, res) => {

  res.clearCookie("auth_token", {
    httpOnly: true, 
    // secure : process.env.NODE_ENV === "production",
    secure: false,
    // maxAge: 3600000,
    sameSite: "strict",
  });
  res.status(200).json( {message: 'Logged out successfully'} );
});



/////////////////////////////////////////////////////////////


app.get('/contacts', async (req, res) => {      
    console.log("==============\n In contacts endpoint\n=============")
    const user_id = parseInt(req.query.user); // Extract user_id query parameter
    var contact_id = null
    if (req.query.contact_id) {
      const parsedContactId = parseInt(req.query.contact_id, 10);
      if (!isNaN(parsedContactId)) {
        contact_id = parsedContactId;
      }
    }

    console.log("user_id = " + user_id)
    console.log("contact_id = " + contact_id)

    // Check if user_id query parameter is provided
    if (!user_id) {
        return res.status(404).send("You did not specify a user_id");
    }

    try {
      // Fetch contacts for the specified user_id
      var contacts = null

      console.log("before if?")

      if(contact_id !== null) {
        console.log("before query")
        contacts = await pool.query("SELECT * FROM contacts WHERE (sender_id = $1 AND contact_id = $2) OR (sender_id = $2 AND contact_id = $1);", [user_id, contact_id]);
        // console.log("contacts = " + JSON.stringify(contacts.rows))
      }
      else {
        console.log("in else")
        contacts = await pool.query("SELECT * FROM contacts WHERE sender_id = $1 OR contact_id = $1 OR (is_group = TRUE AND members @> $2::jsonb);", [user_id, JSON.stringify([user_id])]);
        console.log("Contact id not specified")        
      }
    
      // console.log("rows = " + JSON.stringify(contacts.rows))
        
        // Log the fetched contacts
        // console.log(contacts.rows);

        // Send the contacts as the response
        res.status(200).send(contacts.rows);
    } catch (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/insertContact', async (req, res) => {

  console.log("============\n In insert contact\n==============")
  var {sender_id, contact_id} = req.body;

  if(!sender_id || !contact_id) {
    return res.status(400).send("Bad request")
  }

  console.log(`sender_id: ${sender_id}, contact_id: ${contact_id}`)

  try {
    let users = [sender_id, contact_id]
    let openedAt = []
    let closedAt = []
    for(let user of users) {
      openedAt.push({"id": user, "opened_at": null})
      closedAt.push({"id": user, "closed_at": null})
    }

    const result = await pool.query(
      "INSERT INTO contacts (sender_id, contact_id, group_pic_id, is_group, opened_at, closed_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb) RETURNING *",
      [sender_id, contact_id, null, false, JSON.stringify(openedAt), JSON.stringify(closedAt)]
    );

    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error inserting in contact:", err);
    res.status(500).send("Internal server error");
  }
})

app.get('/contactsGroup', async (req, res) => {      
    var group_id = null;
    if (req.query.group_id) {
      group_id = parseInt(req.query.group_id, 10);
    }

    console.log("group_id = " + group_id)

    // Check if user_id query parameter is provided
    if (!group_id) {
      return res.status(404).send("You did not specify a group_id");
    }

    try {
      // Fetch contacts for the specified user_id
      var contacts = null

      console.log("before query")
      contacts = await pool.query("SELECT * FROM contacts WHERE id = $1;", [group_id]);
      console.log("contacts = " + JSON.stringify(contacts))
      
      // Send the contacts as the response
      res.status(200).send(contacts.rows);
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
});

app.get('/images', async (req, res) => {
    // const user_id = parseInt(req.query.user); // Extract user_id query parameter
    // const image_name = req.query.image_name; // Extract user_id query parameter

    // console.log("user_id = " + user_id)
    // console.log("image name = " + image_name)

    // Check if user_id query parameter is provided
    // if (!user_id || !image_name) {
    //     return res.status(404).send("You did not specify a user_id or an image_name");
    // }

    try {
        console.log("before image query")

        // Fetch contacts for the specified user_id
        const images = await pool.query("SELECT * FROM images;");
        
        // Log the fetched contacts
        // console.log(images.rows);

        // Send the contacts as the response
        res.status(200).send(images.rows);
    } catch (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
    }
})

const clients = new Map(); // Maps user_id => WebSocket

wss.on('connection', (ws, req) => {
  console.log('New client connected');

//   var body = req.query.json()

  const queryObject = url.parse(req.url, true).query; // Parses URL and extracts query parameters
  const userId = queryObject.userId; // Extract user ID
  console.log("userId = " + userId)
  clients.set(userId, ws); // Associate user with their WebSocket

  // Handle incoming messages
  ws.on('message', async (MSG) => {
    try {
      console.log("in try")
      const parsedMessage = JSON.parse(MSG);
      // console.log(`Received message: ${JSON.stringify(parsedMessage)}`);

      /////////////////////////////////////////////////
      //  This is where the group broadcast is done  //
      /////////////////////////////////////////////////
      // console.log("parsedMessage = " + JSON.stringify(parsedMessage))

      if(parsedMessage.hasOwnProperty("group_id")){
        console.log("trying to insert the message in the group")
        var {sender_id, recipient_ids, group_id, message, timestamp} = parsedMessage;
      
        if (!sender_id || !recipient_ids || !group_id || !message || !timestamp) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
          return;
        }
      
        console.log("before recipient web socket")
        // Get recipient's WebSocket
        const recipientWs = clients.get(recipient_ids);

        // Send the message to the intended recipient
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify({ senderId, content })); // Send message
        } else {
          console.log(`Recipient ${recipient_id} is not online.`);
        }

        let msg = message
        let imgBytes = null

        console.log("before testing image in server")

        // to see if it's an image or not
        const isBase64 = (str) => {
          try {
            return btoa(atob(str)) === str; // If the string can be re-encoded to base64, it's valid
          } catch (err) {
            return false; // It's not valid base64
          }
        };

        try{
          // Try decoding the image, but only if it's a valid base64 string
          if (isBase64(message)) {
            try {
              console.log("trying to decode image?");
              imgBytes = atob(message); // Decode base64
              message = {
                "image_id": Math.floor(Math.random() * 10000000) + 5
              };
              console.log("decoding ok");
            } catch (err) {
              console.error("Error decoding image:", err);
            }
          } else {
            console.log("Message is not a valid base64 string");
          }

          /////////////////////////////////////////////////////////////////////////
          // Save the message to the database
          const messageJson = { sender_id, recipient_ids, group_id, message, timestamp };

          try {
            await pool.query(
              `UPDATE contacts
              SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb
              WHERE (id = $2)`,
              [JSON.stringify(messageJson), group_id]
            );
          } catch(err) {
            console.error("Error could not update contacts:" + err)
          }

          console.log("After appending message to DB")
          if(imgBytes !== null) {
            try {
              await pool.query('INSERT INTO images (id, user_id, image_name, data) VALUES ($1, $2, $3, $4)', 
                [message.image_id, sender_id, '', msg]);
            } catch(err) {
              console.error("Could not insert image ")
            }
          }
          /////////////////////////////////////////////////////////////////////////

          // Acknowledge receipt
          ws.send(JSON.stringify({ status: 'success', message: 'Message saved' }));
          console.log("done inserting image in group")
          // Optionally broadcast to other clients
        //   broadcast(wss, ws, parsedMessage);

        } catch (err) {
          console.error('Error handling message:', err);
          ws.send(JSON.stringify({ error: 'Internal server error' }));
        }      
      }

      /////////////////////////
      // END GROUP BROADCAST
      /////////////////////////////////////////////////

      //////////////////////////////////////////////////
      //    This is where the 1 on 1 convo is done    //
      //////////////////////////////////////////////////

      console.log("before 1 on 1 insertion in DB")

      // if(parsedMessage)
      // console.log("parsedMessage = " + JSON.stringify(parsedMessage))

      // Ensure the message has the required fields
      var { sender_id, recipient_id, message, timestamp } = parsedMessage;
      // console.log("sender_id: " + sender_id + "\nrecipient_id: " + recipient_id + "\nmessage:" + message + "\ntimestamp:" + timestamp)
      if (!sender_id || !recipient_id || !message || !timestamp) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
        return;
      }

      console.log("before recipient web socket")
      // Get recipient's WebSocket
      const recipientWs = clients.get(recipient_id);

      // Send the message to the intended recipient
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({ senderId, content })); // Send message
      } else {
        console.log(`Recipient ${recipient_id} is not online.`);
      }

      let msg = message
      let imgBytes = null

      console.log("before testing image in server")

      // to see if it's an image or not
      const isBase64 = (str) => {
      try {
        return btoa(atob(str)) === str; // If the string can be re-encoded to base64, it's valid
      } catch (err) {
        return false; // It's not valid base64
      }
    };

      // Try decoding the image, but only if it's a valid base64 string
      if (isBase64(message)) {
        try {
          console.log("trying to decode image?");
          imgBytes = atob(message); // Decode base64
          message = {
            "image_id": Math.floor(Math.random() * 10000000) + 5
          };
          console.log("decoding ok");
        } catch (err) {
          console.error("Error decoding image:", err);
        }
      } else {
        console.log("Message is not a valid base64 string");
      }

      /////////////////////////////////////////////////////////////////////////
      // Save the message to the database
      const messageJson = { sender_id, recipient_id, message, timestamp };
      await pool.query(
        `UPDATE contacts
         SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb
         WHERE (sender_id = $2 AND contact_id = $3) OR (sender_id = $3 AND contact_id = $2)`,
        [JSON.stringify(messageJson), sender_id, recipient_id]
      );
      if(imgBytes !== null) {
        await pool.query('INSERT INTO images (id, user_id, image_name, data) VALUES ($1, $2, $3, $4)', 
          [message.image_id, sender_id, '', msg]);
      }
      /////////////////////////////////////////////////////////////////////////

      // Acknowledge receipt
      ws.send(JSON.stringify({ status: 'success', message: 'Message saved' }));
      console.log("Success sent")

      // Optionally broadcast to other clients
    //   broadcast(wss, ws, parsedMessage);

    } catch (err) {
      console.error('Error handling message:', err);
      ws.send(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// update 2 tables. for user 
app.post('/putProfilePic', async (req, res) => {
  
  // export const images = pgTable("images", {
  //   id: serial("id").primaryKey(),
  //   id_user: integer("user_id").notNull().references(() => users.id),
  //   contact_id: integer("contact_id").references(() => users.id),
  //   image_name: text("image_name").notNull(), // To keep track of the image name
  //   data: text("data").notNull(), // Base64-encoded image data
  // });

  // // Define the "users" table with columns "id", "username", and "password_hash"
  // export const users = pgTable('users', {
  //   id: serial('id').primaryKey(),
  //   username: varchar('username', { length: 50 }).notNull().unique(),
  //   password_hash: text('password_hash').notNull(),
  //   profile_pic_id: integer("profile_pic_id").references(() => images.id)
  // });



  // STEPS:

  // 1. get the data from the request
  // 2. update the tables (users + images)
  // 3. PROFIT
  console.log("Beginning of request to change profile picture")

  if(req.body.hasOwnProperty('group_id')) {
    const { group_id, data_img, profile_pic_id } = req.body;
    console.log("body of query = " + JSON.stringify(req.body))
    // console.log("id of the user trying to change profile picture: " + body.id)

    if(group_id !== null && profile_pic_id !== null) {
      try {
        console.log("before inserting to images")
        await pool.query(`INSERT INTO images (id, image_name, data) VALUES ($1, $2, $3)`, [profile_pic_id, '', data_img]);
        
        console.log("before updating user profile pic")
        await pool.query(`UPDATE contacts SET group_pic_id = $2 WHERE id = $1`, [group_id, profile_pic_id])

        console.log("put profile_pic in group")
        res.status(200).send("Profile picture changed")
      } catch(error) {
        res.status(500).send("Server error. Image not put in the database.")
      }
    } else {
      res.status(400).send("Bad request. The request doesn't contain an image embedded.")
    }

  } else {
    const { id, data_img, profile_pic_id } = req.body;
    console.log("body of query = " + JSON.stringify(req.body))
    // console.log("id of the user trying to change profile picture: " + body.id)

    if(id !== null && profile_pic_id !== null) {
      try {
        console.log("before inserting to images")
        await pool.query(`INSERT INTO images (id, user_id, image_name, data) VALUES ($1, $2, $3, $4)`, [profile_pic_id, id, '', data_img]);
        
        console.log("before updating user profile pic")
        await pool.query(`UPDATE users SET profile_pic_id = $2 WHERE id = $1`, [id, profile_pic_id])

        res.status(200).send("Profile picture changed")
      } catch(error) {
        res.status(500).send("Server error. Image not put in the database.")
      }
    } else {
      res.status(400).send("Bad request. The request doesn't contain an image embedded.")
    }
  }
});

app.post('/changeGroupDescription', async (req, res) => {

  const { group_id, description } = req.body
  
  console.log("Before if in change group description")
  console.log("body method " + JSON.stringify(req.body))
  if (group_id !== null || description !== null) {
    try{
      console.log("Before updating contacts")
      await pool.query(`UPDATE contacts SET group_description = $2 WHERE id = $1`, [group_id, description])
      
      console.log("After updating contacts")
      
      res.status(200).send("Group description changed")
    } catch(err) {
      res.status(400).send("Bad request. The request doesn't contain the right parameters.")
    }
  }
});


app.post('/changeUsername', async (req, res) => {

  const { id, new_username } = req.body;
  console.log("body of query = " + JSON.stringify(req.body))

  if(id !== null && new_username !== null) {
    try {
      await pool.query(`UPDATE users SET username = $2 WHERE id = $1`, [id, new_username])
      
      res.sendStatus(200)
    } catch(err) {
      res.sendStatus(500)
    }
  } else {
    res.sendStatus(400)
  }
})

app.post('/changeAbout', async (req, res) => {

  const { id, new_about } = req.body;
  console.log("body of query = " + JSON.stringify(req.body))

  if(id !== null && new_about !== null) {
    try {
      await pool.query(`UPDATE users SET about = $2 WHERE id = $1`, [id, new_about])
      
      res.sendStatus(200)
    } catch(err) {
      res.sendStatus(500)
    }
  } else {
    res.sendStatus(400)
  }
})

app.post('/createGroup', async (req, res) => {
  const { admin, users, group_name, description, image } = req.body;

  if (users !== null && Array.isArray(users)) {
    try {
      const rdm = Math.floor(Math.random() * 10000000) + 5; // Generate a random ID
      
      console.log("Before inserting group into contacts");

      const groups_w_name = await pool.query(`SELECT * from contacts WHERE group_name=$1`, [group_name]);

      console.log("group with the same name: " + JSON.stringify(groups_w_name.rows))
      console.log(`There are ${groups_w_name.rows.length} groups with the same name`)

      // if there's already a group with that name, we don't do nothing
      if(groups_w_name.rows.length > 0) {
        res.sendStatus(409);
      } else {

        const id_img = Math.floor(Math.random() * 10000000) + 5; // Generate a random ID

        console.log("id image = " + id_img.toString())
        // console.log("image = " + image.toString())
        var image_new = ""
        if(image === null) image_new = "" 
        else image_new = image

        // Insert image into "images" table
        await pool.query(
          "INSERT INTO images (id, user_id, contact_id, image_name, data) VALUES ($1, $2, $3, $4, $5)",
          [id_img, null, null, "", image_new] // Serialize users array to JSON
        );

        console.log("inserted image")

        let openedAt = []
        let closedAt = []
        for(let user of users) {
          openedAt.push({"id": user, "opened_at": null})
          closedAt.push({"id": user, "closed_at": null})
        }

        // Insert the group into the "contacts" table
        await pool.query(
          `INSERT INTO contacts (id, group_name, is_group, sender_id, contact_id, members, admins, group_description, group_pic_id, opened_at, closed_at) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10::jsonb, $11::jsonb)`,
          [rdm, group_name, true, null, null, JSON.stringify(users), JSON.stringify([admin]), description, id_img, JSON.stringify(openedAt), JSON.stringify(closedAt)] // Serialize users array to JSON
        );

        console.log("After inserting group into contacts");
        res.sendStatus(200);
      }

    } catch (err) {
      console.error("Error inserting into the database:", err.message);
      res.sendStatus(500);
    }
  } else {
    console.error("Invalid or missing 'users' array");
    res.status(400).send({ error: "Invalid 'users' array" });
  }
});

app.post('/exitGroup', async (req, res) => {
  const { curr_user, group_id } = req.body;

  console.log("curr_user = " + curr_user + " group_id = " + group_id)
  if (curr_user !== null && group_id !== null) {
    try { 
      console.log("Before deleting member from group");

      // Insert the group into the "contacts" table
      await pool.query(
          `
          UPDATE contacts
          SET members = (
              SELECT jsonb_agg(elem)
              FROM jsonb_array_elements(members) AS elem
              WHERE elem::int <> $1
          )
          WHERE is_group = true
            AND id = $2
            AND members @> to_jsonb($1::int);
          `,
        [curr_user, group_id] // Bind variables
      );


      console.log("After deleting member from group");
      res.sendStatus(200);
    } catch (err) {
      console.error("Error deleting member from group:", err.message);
      res.sendStatus(500);
    }
  } else {
    console.error("Invalid or missing curr_user or group_id parameters");
    res.status(400).send({ error: "Invalid or missing curr_user or group_id parameters"});
  }
});

app.post('/makeAdmin', async (req, res) => {
  const {userToAddAsAdmin, group_id, admins} = req.body;

  if(!userToAddAsAdmin) res.status(400).send("Missing user to add as admin")
  if(!group_id) res.status(400).send("Missing group_id")
  
  try {

    console.log(`in makeAdmin endpoint adding ${userToAddAsAdmin} to admin list ${admins}`)

    // push() modifies the array in place and returns the length, not the array
    const new_admins = [...admins, userToAddAsAdmin]; // Create new array with added admin

    console.log(`new admins: ${new_admins}`)

    // Use parameterized query to prevent SQL injection
    await pool.query(
      'UPDATE contacts SET admins = $1 WHERE id = $2',
      [JSON.stringify(new_admins), group_id]
    );
    
    console.log("successfully updated admin list: ", new_admins);
    res.status(200).json({ success: true, admins: new_admins }); // Send success response

    console.log("successfully updated admin list: " + new_admins)

  } catch(error) {
    res.status(500).send(JSON.stringify(error))
  }
});

app.post('/deleteChat', async (req, res) => {
  const { curr_user, contact_id } = req.body;

  console.log("curr_user = " + curr_user + " group_id = " + contact_id)
  if (curr_user !== null && contact_id !== null) {
    try { 
      console.log("Before deleting member from group");

      // Insert the group into the "contacts" table
      await pool.query(
          `DELETE FROM contacts WHERE sender_id=$1 AND contact_id=$2`,
        [curr_user, contact_id] // Bind variables
      );


      console.log("After deleting chat");
      res.sendStatus(200);
    } catch (err) {
      console.error("Error deleting chat", err.message);
      res.sendStatus(500);
    }
  } else {
    console.error("Invalid or missing curr_user or contact_id parameters");
    res.status(400).send({ error: "Invalid or missing curr_user or contact_id parameters"});
  }
});

app.put('/blockContact', async (req, res) => {
  const { curr_user, contact_id, status} = req.body;

  console.log("curr_user = " + curr_user + " group_id = " + contact_id)
  if (curr_user !== null && contact_id !== null && status !== null) {
    try { 
      console.log("Before blocking contact");

      const timestamp = new Date().toISOString()
      console.log("type timestamp = " + typeof(timestamp))
      // Insert the group into the "contacts" table
      if(status === "block") {
        await pool.query(
            `UPDATE contacts SET blockedat=$3::varchar, blocked=$4 WHERE (sender_id=$1 AND contact_id=$2) OR (sender_id=$2 AND contact_id=$1)`,
          [curr_user, contact_id, timestamp, true] // Bind variables
        );
      } else if(status === "unblock") {

        console.log("In server before unblocking")

        await pool.query(
            `UPDATE contacts SET blockedat=$3::varchar, blocked=$4 WHERE (sender_id=$1 AND contact_id=$2) OR (sender_id=$2 AND contact_id=$1)`,
          [curr_user, contact_id, '', false] // Bind variables
        );
      }

      console.log("After blocking contact");
      res.sendStatus(200);
    } catch (err) {
      console.error("Error blocking contact", err.message);
      res.sendStatus(500);
    }
  } else {
    console.error("Invalid or missing curr_user or contact_id parameters");
    res.status(400).send({ error: "Invalid or missing curr_user or contact_id parameters"});
  }
});



app.post('/changeGroupName', async (req, res) => {

  const { id, newName } = req.body;
  console.log("body of query = " + JSON.stringify(req.body))

  if(id !== null && newName !== null) {
    try {
      await pool.query(`UPDATE contacts SET group_name = $2 WHERE id = $1`, [id, newName])
      console.log("after update in DB")
      res.sendStatus(200)
    } catch(err) {
      res.sendStatus(500)
    }
  } else {
    res.sendStatus(400)
  }
})

app.post('/insertMembersInGroup', async (req, res) => {

  const { members , group_id } = req.body;

  var members_ids = []
  for(let m of members) {
    console.log("type of id = " + typeof(m.id))
    members_ids.push(m.id)
  }
  console.log("body of query = " + JSON.stringify(req.body))
  console.log("members ids = " + JSON.stringify(members_ids) + " group_id = " + group_id)

  if(group_id !== null && members_ids.length !== 0) {
    try {
      console.log("before adding members to group")
      await pool.query(`UPDATE contacts 
         SET members = (COALESCE(members, '[]'::jsonb) || $2::jsonb) 
         WHERE id = $1`,  [group_id, JSON.stringify(members_ids)])
      console.log("after update in DB")
      res.sendStatus(200)
    } catch(err) {
      console.error("Detailed error" + err.message)
      res.sendStatus(500)
    }
  } else {
    res.sendStatus(400)
  }
})

app.post('/changeOutgoingMessageSoundsSetting', async (req, res) => {
  const { new_setting, user } = req.body;
  
  console.log("Before checking body elements")

  if (new_setting === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_setting' or 'user' field" });
  }

  console.log("before updating in changeOutgoing")

  try {
    const resp = await pool.query(
      "UPDATE users SET outgoing_sounds = $1 WHERE id = $2 RETURNING *",
      [new_setting, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
 
    console.log("update succeeded")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/changeIncomingMessageSoundsSetting', async (req, res) => {
  const { new_setting, user } = req.body;

  console.log("Before checking body elements")

  console.log("new_setting: " + JSON.stringify(new_setting) + ", user: " + JSON.stringify(user))

  if (new_setting === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_setting' or 'user' field" });
  }

  console.log("before updating in changeIncoming")

  try {
    const resp = await pool.query(
      "UPDATE users SET incoming_sounds = $1 WHERE id = $2 RETURNING *",
      [new_setting, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in incoming messages")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/changeNotificationsEnabled', async (req, res) => {
  const { new_setting, user } = req.body;

  console.log("Before checking body elements")

  if (new_setting === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_setting' or 'user' field" });
  }

  console.log("before updating in changeNotificationsEnabled")

  try {
    const resp = await pool.query(
      "UPDATE users SET notifications_enabled = $1 WHERE id = $2 RETURNING *",
      [new_setting, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in incoming messages")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post('/changeTheme', async (req, res) => {
  const { user, new_theme } = req.body;

  console.log("Before checking body elements")

  if (new_theme === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_theme' or 'user' field" });
  }

  console.log("before updating in changeTheme")

  try {
    const resp = await pool.query(
      "UPDATE users SET theme = $1 WHERE id = $2 RETURNING *",
      [new_theme, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in incoming messages")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post('/changeFont', async (req, res) => {
  const { user, new_font } = req.body;

  console.log("Before checking body elements")

  if (new_font === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_font' or 'user' field" });
  }

  console.log("before updating in changeFont")

  try {
    const resp = await pool.query(
      "UPDATE users SET font = $1 WHERE id = $2 RETURNING *",
      [new_font, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in changeFont")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put('/changeProfilePicVisibility', async (req, res) => {
  const { user, new_visibility } = req.body;

  console.log("Before checking body elements")

  if (new_visibility === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_visibility' or 'user' field" });
  }

  console.log("before updating in changeProfilePicVisibility")

  try {
    const resp = await pool.query(
      "UPDATE users SET profile_pic_visibility = $1 WHERE id = $2 RETURNING *",
      [new_visibility, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in changeProfilePicVisibility")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put('/changeStatusVisibility', async (req, res) => {
  const { user, new_visibility } = req.body;

  console.log("Before checking body elements")

  if (new_visibility === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_visibility' or 'user' field" });
  }

  console.log("before updating in changeStatusVisibility")

  try {
    const resp = await pool.query(
      "UPDATE users SET status_visibility = $1 WHERE id = $2 RETURNING *",
      [new_visibility, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in changeStatusVisibility")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put('/changeDisappearingMessagesPeriod', async (req, res) => {
  const { user, new_period } = req.body;

  console.log("Before checking body elements")

  if (new_period === undefined || !user) {
    return res.status(400).json({ error: "Missing 'new_period' or 'user' field" });
  }

  console.log("before updating in changeDisappearingMessagesPeriod")

  try {
    const resp = await pool.query(
      "UPDATE users SET disappearing_message_period = $1 WHERE id = $2 RETURNING *",
      [new_period, user]
    );

    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
      
    console.log("update succeeded in changeDisappearingMessagesPeriod")

    res.status(200).json({
      message: "Outgoing message sound setting updated successfully",
      user: resp.rows[0]
    });
  } catch (err) {
    console.error("Error updating outgoing_sounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/accessedChat', async (req, res) => {
  console.log("===============\n IN ACCESSED CHAT ENDPOINT\n===============")

  const {curr_user, contact, accessed_at} = req.body;
  
  console.log(`curr_user: ${curr_user}, contact: ${contact}, accessed_at: ${accessed_at}`)

  if(!curr_user || !contact || !accessed_at) {
    return res.status(400).json({ error: "Missing request parameters" });
  }
  
  try {
    // Update the openedAt timestamp for the specific user in the opened_at JSONB array
    const resp = await pool.query(
      `UPDATE contacts 
       SET opened_at = (
         SELECT jsonb_agg(
           CASE 
             WHEN elem->>'id' = $1::text 
             THEN jsonb_set(elem, '{opened_at}', to_jsonb($3::text))
             ELSE elem
           END
         )
         FROM jsonb_array_elements(opened_at) AS elem
       )
       WHERE id = $2`,
      [curr_user.toString(), contact.id, accessed_at]
    );

    
    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    console.log("Inserted correctly:" + JSON.stringify(resp.rows[0]))
    
    console.log(`Updated openedAt for user ${curr_user} in contact ${contact.id}`);
    res.status(200).json({ success: true });
    
  } catch(err) {
    console.error(`Error updating access time for contact ${JSON.stringify(contact)}:`, err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put('/closeChat', async (req, res) => {
  console.log("===============\n IN CLOSED CHAT ENDPOINT\n===============")

  const {curr_user, contact, exited_at} = req.body;
  
  console.log(`curr_user: ${curr_user}, contact: ${contact}, exited_At: ${exited_at}`)

  if(!curr_user || !contact || !exited_at) {
    return res.status(400).json({ error: "Missing request parameters" });
  }
  
  try {
    // Update the closedAt timestamp for the specific user in the closed_at JSONB array
    const resp = await pool.query(
      `UPDATE contacts 
       SET closed_at = (
         SELECT jsonb_agg(
           CASE 
             WHEN elem->>'id' = $1::text 
             THEN jsonb_set(elem, '{closed_at}', to_jsonb($3::text))
             ELSE elem
           END
         )
         FROM jsonb_array_elements(closed_at) AS elem
       )
       WHERE id = $2`,
      [curr_user.toString(), contact.id, exited_at]
    );

    
    if (resp.rowCount === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    console.log("Inserted correctly:" + JSON.stringify(resp.rows[0]))
    
    console.log(`Updated openedAt for user ${curr_user} in contact ${contact.id}`);
    res.status(200).json({ success: true });
    
  } catch(err) {
    console.error(`Error updating access time for contact ${JSON.stringify(contact)}:`, err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
