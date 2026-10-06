require('dotenv').config({ path: 'front/.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'voting';
  const email = process.env.ADMIN_EMAIL;
  const plainTextPassword = process.env.ADMIN_PASSWORD;

  if (!uri || !email || !plainTextPassword) {
    throw new Error(
      'MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured'
    );
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      console.log('Admin user already exists.');
      return;
    }

    const password = await bcrypt.hash(plainTextPassword, 10);
    await users.insertOne({
      email,
      password,
      role: 'admin',
      walletAddress: '',
    });
    console.log('Admin user created.');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

createAdmin();
