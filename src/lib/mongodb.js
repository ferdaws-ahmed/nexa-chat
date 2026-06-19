import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

const uri = process.env.MONGO_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((connectedClient) => {
        console.log('✅ MongoDB connected successfully (cached)');
        return connectedClient;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        // Clear cached promise on failure so next attempt tries fresh
        global._mongoClientPromise = null;
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log('✅ MongoDB connected successfully');
      return connectedClient;
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      throw err;
    });
}

/**
 * Get the database instance
 */
export async function getDb() {
  try {
    const connectedClient = await clientPromise;
    
    // Hardcoding the database name as requested for stability
    // instead of complex string parsing.
    const dbName = 'nexachat';
    
    return connectedClient.db(dbName);
  } catch (error) {
    console.error('❌ MongoDB getDb Error:', error.message);
    
    // Clear global cache if authentication failed to force a fresh connection attempt next time
    if (error.message.includes('authentication failed')) {
      if (process.env.NODE_ENV === 'development') {
        global._mongoClientPromise = null;
      }
      throw new Error('ডাটাবেস ইউজারনেম বা পাসওয়ার্ড ভুল। অনুগ্রহ করে .env ফাইল চেক করুন।');
    }
    
    throw error;
  }
}

export default clientPromise;
