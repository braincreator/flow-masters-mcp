// scripts/create-admin-user.js
import path from 'path';
import payload from 'payload';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url'; // Needed for __dirname equivalent in ESM

// Derive __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local or similar
dotenv.config({ path: path.resolve(__dirname, '../.env.local') }); // Adjust path if your .env is elsewhere

const email = 'ay.krasnodar@gmail.com';
const password = 'Shturmovik89'; // Remember to use a strong, unique password in production

const createAdminUser = async () => {
  console.log('Initializing Payload...');
  try {
    // Dynamically import the Payload config
    const configPath = path.resolve(__dirname, '../src/payload.config.ts');
    // Use file URL for dynamic import of TS file if running with tsx/ts-node
    const config = await import(configPath);

    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET, // Ensure PAYLOAD_SECRET is in your .env
      config: config.default, // Pass the imported config object
      local: true, // Use Local API
      onInit: async (cms) => {
         cms.logger.info('Payload initialized successfully.');
      },
    });

    console.log(`Checking for user: ${email}`);

    // Check if user already exists
    const existingUsers = await payload.find({
        collection: 'users',
        where: {
            email: {
                equals: email,
            },
        },
        limit: 1,
    });

    if (existingUsers.docs.length > 0) {
        const user = existingUsers.docs[0];
        console.log(`User with email ${email} found (ID: ${user.id}). Checking roles...`);

        // Check if user already has the admin role
        if (user.roles && user.roles.includes('admin')) {
            console.log(`User ${email} already has admin role.`);
            process.exit(0); // Exit successfully as the user exists and has the role
        } else {
            console.log(`User ${email} does not have admin role. Attempting update...`);
            // Add 'admin' role, ensuring the roles array exists
            const updatedRoles = [...(user.roles || []), 'admin'];
            // Optional: Ensure uniqueness if needed, though roles usually allow duplicates unless schema prevents it
            // const updatedRoles = [...new Set([...(user.roles || []), 'admin'])];

            await payload.update({
                collection: 'users',
                id: user.id,
                data: {
                    roles: updatedRoles,
                },
            });
            console.log(`Successfully updated user ${email} to include admin role.`);
            process.exit(0); // Exit successfully after update
        }
    } else {
        console.log(`User with email ${email} not found. Attempting to create...`);
        // Create the user if they don't exist
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: email,
            password: password,
            roles: ['admin'],
            name: 'Admin User', // Added a default name, adjust as needed
            // No _verified: true needed as auth.verify is false
          },
        });

        console.log(`Successfully created admin user with ID: ${newUser.id}`);
        process.exit(0); // Exit successfully after creation
    }

  } catch (error) {
    console.error('Error during admin user check/creation/update:', error);
    process.exit(1); // Exit with error
  }
};

createAdminUser();