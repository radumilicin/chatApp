import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

console.log("in drizzle config = " + process.env.DATABASE_PSWD)
console.log("pswd type " + typeof(process.env.DATABASE_PSWD))
console.log("url = " + process.env.DATABASE_URL!)

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: '127.0.0.1',
    port: 5432,
    database: 'chatapp',
    user: 'postgres',
    password: process.env.DATABASE_PSWD!,
    ssl: false, // Disable SSL
  },
});