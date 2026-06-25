/**
 * models/User.js
 *
 * Defines the User schema for MongoDB.
 * A schema is like a blueprint that describes what data
 * each user document can store and how it is validated.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    /**
     * name — User's full display name.
     * Required for personalization (e.g. "Welcome, John").
     * Trim removes extra spaces from start/end.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    /**
     * email — Unique identifier for login.
     * Stored in lowercase so "User@Mail.com" and "user@mail.com" match.
     * Must be unique across all users in the database.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },

    /**
     * password — Hashed password (never store plain text).
     * Minimum 6 characters for basic security.
     * select: false means password is NOT returned in queries by default.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
  },
  {
    /**
     * timestamps — Automatically adds:
     *   createdAt — when the user account was created
     *   updatedAt — when the user record was last modified
     */
    timestamps: true,
  }
);

/**
 * Pre-save hook — runs BEFORE a user document is saved to DB.
 * Hashes the password so we never store plain text passwords.
 */
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (e.g. new user or password change)
  if (!this.isModified('password')) {
    return next();
  }

  // bcrypt with salt rounds of 10 — industry standard for password hashing
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method — compare entered password with hashed password in DB.
 * Used during login to verify credentials.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
