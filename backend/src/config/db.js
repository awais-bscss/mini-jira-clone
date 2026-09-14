const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-jira';

  mongoose.connection.on('connected', () => {
    console.log('[OK] Connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[ERROR] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[WARN] MongoDB disconnected');
  });

  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error('[ERROR] Failed initial MongoDB connection:', err.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('[OK] Disconnected from MongoDB');
  } catch (err) {
    console.error('[ERROR] Failed to disconnect from MongoDB:', err.message);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};
