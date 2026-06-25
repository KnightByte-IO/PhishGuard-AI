/**
 * config/db.js
 *
 * Handles MongoDB database connection using Mongoose.
 * Mongoose is an ODM (Object Data Modeling) library that
 * lets us define schemas and interact with MongoDB easily.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * Called once when the server starts.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error(
      'Invalid MONGODB_URI — must start with mongodb:// or mongodb+srv://'
    );
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
