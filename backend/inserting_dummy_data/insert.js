import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Create a PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: '127.0.0.1',
    database: 'chatapp', // Replace with your database name
    password: process.env.DATABASE_PSWD,  // Replace with your password
    port: 5432, // Default PostgreSQL port
});
// Function to insert a user with a hashed password
async function insertUser(username, password) {
    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a client from the pool
        const client = await pool.connect();
        try {
            // Insert the user into the "users" table
            await client.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword]);
            console.log(`User '${username}' inserted successfully.`);
        }
        catch (err) {
            console.error('Error inserting user:', err);
        }
        finally {
            // Release the client back to the pool
            client.release();
        }
    }
    catch (err) {
        console.error('Error hashing password or connecting to the database:', err);
    }
}
// Example usage
insertUser('exampleUser', 'securePassword123')
    .catch((err) => console.error('Error:', err))
    .finally(() => pool.end()); // Close the pool when done
