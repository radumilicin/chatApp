import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

console.log("password = " + process.env.DATABASE_PSWD)

const app = express();
app.use(cors())
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

    console.log("user_id = " + user_id)

    // Check if user_id query parameter is provided
    if (!user_id) {
        return res.status(404).send("You did not specify a user_id");
    }

    try {
        // Fetch contacts for the specified user_id
        const contacts = await pool.query("SELECT * FROM contacts WHERE id = $1;", [user_id]);
        
        // Log the fetched contacts
        console.log(contacts.rows);

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
        console.log(images.rows);

        // Send the contacts as the response
        res.status(200).send(images.rows);
    } catch (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
    }
})


app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
