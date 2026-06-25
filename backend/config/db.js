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
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Exit process if DB connection fails — server cannot run without DB
    process.exit(1);
  }
};

module.exports = connectDB;
