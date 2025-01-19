import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import 'dotenv/config'
import readline from 'readline';
import fs from "fs";

console.log("aa")
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
            'INSERT INTO contacts (sender_id, is_group, contact_id) VALUES ($1, $2, $3)',
            [id, false, contact_id]
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

// await insertContacts().catch((err) => console.error('Error:', err)).finally(() => pool.end()); // Close the pool when done

// await insertUsers().catch((err) => console.error('Error:', err)).finally(() => pool.end()); // Close the pool when done
async function insertImages() {
    try {
        // Ask to what user we are adding the image
        var user_id = await new Promise((resolve) => {
            rl.question("Enter user_id: ", (answer) => {
                resolve(answer);
            });
        });

        // Ask for image path
        var image_path : string = await new Promise((resolve) => {
            rl.question("Enter image_path: ", (answer) => {
                resolve(answer);
            });
        });    

        console.log("curr dir: " + process.cwd())

        let imageBuffer = fs.readFileSync(image_path);
        
        console.log("imageBuffer" + imageBuffer)

        const base64Image = imageBuffer.toString("base64");

        console.log("base64Image" + base64Image)
        
        // Create a client from the pool
        const client = await pool.connect();
        try {
            // Insert the user into the "users" table
            await client.query('INSERT INTO images (user_id, image_name, data) VALUES ($1, $2, $3)', [user_id, image_path, base64Image]);
            console.log(`Image ${image_path} has been added to user ${user_id} inserted successfully.`);
        }
        catch (err) {
            console.error('Error inserting images:', err);
        }
        finally {
            // Release the client back to the pool
            client.release();
        }
        // Decrement the number of users left to add
    }
    catch (err) {
        console.error('Error:', err);
    } 
}

// await insertImages().catch((err) => console.error('Error:', err)).finally(() => pool.end()); // Close the pool when done

async function insertMessageContacts() {
  try{
        // Ask to what user we are adding the image
        var user_id : number = parseInt(await new Promise((resolve) => {
            rl.question("Enter user_id: ", (answer) => {
                resolve(answer);
            });
        }));

        // Ask for image path
        var contact_id : number = parseInt(await new Promise((resolve) => {
            rl.question("Enter contact_id: ", (answer) => {
                resolve(answer);
            });
        }));

        // Ask for image path
        var message : string = await new Promise((resolve) => {
            rl.question("Enter message: ", (answer) => {
                resolve(answer);
            });
        });

        var timestamp = new Date().toISOString();
        
        const messageJson = { user_id, contact_id, message, timestamp };
        
        const client = await pool.connect();
        try {
          await pool.query(
            `UPDATE contacts
            SET message = COALESCE(message, '[]'::jsonb) || $1::jsonb
            WHERE (id = $2 AND contact_id = $3) OR (id = $3 AND contact_id = $2)`,
            [JSON.stringify(messageJson), user_id, contact_id]
          );
        } catch(err) {
          console.error(err)
        }
        finally {
          client.release()
        }
  }
  catch(err) {
    console.error(err)
  }
}

// await insertMessageContacts().catch((err) => console.error('Error:', err)).finally(() => pool.end()); // Close the pool when done