import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import 'dotenv/config'
import readline from 'readline';

console.log(process.env)

// Create an interface for reading input from stdin and writing output to stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',  // Replace with your PostgreSQL username
  host: '127.0.0.1',
  database: 'chatapp',   // Replace with your database name
  password: process.env.DATABASE_PSWD,  // Replace with your password
  port: 5432,  // Default PostgreSQL port
});

// Function to insert a user with a hashed password
async function insertUser(username: string, password: string) {
  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a client from the pool
    const client = await pool.connect();

    try {
      // Insert the user into the "users" table
      await client.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
        [username, hashedPassword]
      );
      console.log(`User '${username}' inserted successfully.`);
    } catch (err) {
      console.error('Error inserting user:', err);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Error hashing password or connecting to the database:', err);
  }
}

// Example usage
// insertUser('exampleUser', 'securePassword123')
//   .catch((err) => console.error('Error:', err))
//   .finally(() => pool.end());  // Close the pool when done


    // Function to insert a user with a hashed password
async function insertUsers() {

    var nr_users : number = await new Promise((resolve) => {
      rl.question("How many users do you want to add? ", (answer) => {
        resolve(parseInt(answer, 10));
      });
    });

    // Start the loop
    while (nr_users  > 0) {
      try {
        // Ask for username
        const username : string = await new Promise((resolve) => {
          rl.question("Enter username: ", (answer) => {
            resolve(answer);
          });
        });

        // Ask for password
        var password : string = await new Promise((resolve) => {
          rl.question("Enter password: ", (answer) => {
            resolve(answer);
          });
        });

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a client from the pool
        const client = await pool.connect();

        try {
          // Insert the user into the "users" table
          await client.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            [username, hashedPassword]
          );
          console.log(`User ${username} inserted successfully.`);
        } catch (err) {
          console.error('Error inserting user:', err);
        } finally {
          // Release the client back to the pool
          client.release();
        }
        
        // Decrement the number of contacts  left to add
        nr_users --;
      } catch (err) {
        console.error('Error:', err);
      }
    }
    
}

// await insertUsers().catch((err) => console.error('Error:', err)).finally(() => pool.end()); // Close the pool when done

async function insertContacts() {

  var nr_contacts  : number = await new Promise((resolve) => {
      rl.question("How many contacts do you want to add? ", (answer) => {
        resolve(parseInt(answer, 10));
      });
    });

    // Start the loop
    while (nr_contacts  > 0) {
      try {
        // Ask for username
        const id = await new Promise((resolve) => {
          rl.question("Enter id: ", (answer) => {
            resolve(answer);
          });
        });

        // Ask for password
        var contact_id : string = await new Promise((resolve) => {
          rl.question("Enter contact_id: ", (answer) => {
            resolve(answer);
          });
        });

        // Create a client from the pool
        const client = await pool.connect();

        try {
          // Insert the user into the "users" table
          await client.query(
            'INSERT INTO contacts (id, contact_id) VALUES ($1, $2)',
            [id, contact_id]
          );
          console.log(`Contact (${id},${contact_id}) inserted successfully.`);
        } catch (err) {
          console.error('Error inserting user:', err);
        } finally {
          // Release the client back to the pool
          client.release();
        }

        // Decrement the number of users left to add
        nr_contacts --;
      } catch (err) {
        console.error('Error:', err);
      }
    }  
}

await insertContacts().catch((err) => console.error('Error:', err)).finally(() => pool.end()); // Close the pool when done