const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually parse .env for the test script to be 100% sure
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*MONGO_URI\s*=\s*(.*)\s*$/);
      if (match) {
        process.env.MONGO_URI = match[1].trim();
      }
    });
  }
}

async function testConnection() {
  loadEnv();
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is missing in .env');
    return;
  }

  if (uri.includes('<username>') || uri.includes('<password>')) {
    console.error('❌ MONGO_URI still contains placeholders (<username> or <password>)');
    console.log('Current URI:', uri); // Help user see what's wrong
    return;
  }

  console.log('Attempting to connect to MongoDB...');
  // Extracting host for logging
  const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
  console.log('Using URI:', maskedUri);

  const client = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000 
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    const dbName = uri.split('/').pop().split('?')[0] || 'nexachat';
    console.log(`📡 Database Name: ${dbName}`);
    
    // Test listing collections
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`📦 Collections found: ${collections.length}`);
    
    await client.close();
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(err.message);
    if (err.message.includes('authentication failed')) {
      console.error('👉 Tip: Check your database username and password.');
    } else if (err.message.includes('timeout')) {
      console.error('👉 Tip: Check your internet connection or IP whitelist in MongoDB Atlas.');
    } else {
      console.error('👉 Full Error:', JSON.stringify(err, null, 2));
    }
  }
}

testConnection();
