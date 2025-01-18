import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import { WebSocketServer } from 'ws'
import url from 'url'

dotenv.config();

// console.log("password = " + process.env.DATABASE_PSWD)
const wss = new WebSocketServer({ port: 8080 });

const app = express();
app.use(cors())
app.use(express.json({ limit: '10mb' })); // Adjust limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const PORT = 3002;


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

app.get('/contacts', async (req, res) => {      
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
        contacts = await pool.query("SELECT * FROM contacts WHERE (id = $1 AND contact_id = $2);", [user_id, contact_id]);
        console.log("contacts = " + JSON.stringify(contacts))
      }
      else {
        console.log("in else")
        contacts = await pool.query("SELECT * FROM contacts WHERE id = $1 OR contact_id = $1;", [user_id]);
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

      // Ensure the message has the required fields
      var { user_id, recipient_id, message, timestamp } = parsedMessage;
      // console.log("user_id: " + user_id + "\nrecipient_id: " + recipient_id + "\nmessage:" + message + "\ntimestamp:" + timestamp)
      if (!user_id || !recipient_id || !message || !timestamp) {
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
      const messageJson = { user_id, recipient_id, message, timestamp };
      await pool.query(
        `UPDATE contacts
         SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb
         WHERE (id = $2 AND contact_id = $3) OR (id = $3 AND contact_id = $2)`,
        [JSON.stringify(messageJson), user_id, recipient_id]
      );
      if(imgBytes !== null) {
        await pool.query('INSERT INTO images (id, user_id, contact_id, image_name, data) VALUES ($1, $2, $3, $4, $5)', 
          [message.image_id, user_id, recipient_id, '', msg]);
      }
      /////////////////////////////////////////////////////////////////////////

      // Acknowledge receipt
      ws.send(JSON.stringify({ status: 'success', message: 'Message saved' }));

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

});


app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
