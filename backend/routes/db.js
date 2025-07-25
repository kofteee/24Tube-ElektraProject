const { MongoClient } = require('mongodb');

require('dotenv').config();
const client = new MongoClient(process.env.DATABASE_URL);

let dbInstance = null; // For caching

async function connectDB() {
  if (dbInstance) return dbInstance; // Caching

  try {
    await client.connect();
    dbInstance = client.db('mydatabase');
    console.log('✅ Connected to MongoDB via native driver');
    return dbInstance;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;