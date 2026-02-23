// src/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Determine the root directory of the 'server' project
// This assumes the script is run from somewhere inside the 'server' directory
const serverRoot = process.cwd(); 

// Construct the path to the .env file
const envPath = path.resolve(serverRoot, '.env');

// Load the .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
  // This is not a fatal error, as env vars can be provided by the system
  console.log(`Note: Could not find or load .env file from ${envPath}. Relying on system environment variables.`);
} else {
  console.log(`Successfully loaded environment variables from ${envPath}`);
}

// For Railway or other hosting, the variables are usually already in process.env
// This log helps confirm what's being loaded
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('PORT loaded:', process.env.PORT ? 'Yes' : 'No');
console.log('CLIENT_URL loaded:', process.env.CLIENT_URL ? 'Yes' : 'No');
