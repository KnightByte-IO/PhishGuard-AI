/**
 * middleware/authMiddleware.js
 *
 * Protects routes that require a logged-in user.
 * Reads JWT from Authorization header and verifies it.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: verify JWT and attach user to request object.
 * Used on routes like GET /api/auth/profile
 */
const protect = async (req, res, next) => {
  let token;

  // Expect header format: "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token (exclude password field)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid or expired token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }
};

module.exports = { protect };
