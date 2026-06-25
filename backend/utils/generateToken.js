/**
 * utils/generateToken.js
 *
 * Utility to create JWT (JSON Web Token) for authenticated users.
 * JWT is a secure way to prove identity without sending password on every request.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT containing the user's ID.
 *
 * @param {string} userId - MongoDB _id of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
