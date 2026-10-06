import { MongoClient, MongoError, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  connectTimeoutMS: 30000, // Increased to 30 seconds
  serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
  socketTimeoutMS: 45000, // Increased to 45 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: 1
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log('Successfully connected to MongoDB Atlas in development');
        return client;
      })
      .catch(error => {
        console.error('MongoDB connection error in development:', error);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('Successfully connected to MongoDB Atlas in production');
      return client;
    })
    .catch(error => {
      console.error('MongoDB connection error in production:', error);
      throw error;
    });
}

export async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'voting-platform');

    // Test the connection
    await db.command({ ping: 1 });
    console.log('Successfully connected to database:', db.databaseName);

  // Create collections if they don't exist
    await db.createCollection('users').catch((e: MongoError) => {
      if (e.code !== 48) { // 48 is collection already exists
        throw e;
      }
    });
    await db.createCollection('votings').catch((e: MongoError) => {
      if (e.code !== 48) throw e;
    });
    await db.createCollection('tokens').catch((e: MongoError) => {
      if (e.code !== 48) throw e;
    });
    await db.createCollection('subscriptions').catch((e: MongoError) => {
      if (e.code !== 48) throw e;
    });
    await db.createCollection('votes').catch((e: MongoError) => {
      if (e.code !== 48) throw e;
    });

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('votings').createIndex({ createdAt: -1 });
  await db.collection('votes').createIndex({ votingId: 1, userId: 1 }, { unique: true });

  return { db, client };
  } catch (error) {
    console.error('Detailed connection error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof MongoError ? 'MongoError' : 'Unknown',
      code: error instanceof MongoError ? error.code : undefined
    });
    throw error;
  }
}

export default clientPromise;
