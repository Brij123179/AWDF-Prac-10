import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import { inMemoryStore } from '../models/inMemoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Bearer token is missing'
        });
      }

      const secret = process.env.JWT_SECRET || 'supersecret_jwt_key_practical10_awdf_2026';
      const decoded = jwt.verify(token, secret);

      if (mongoose.connection.readyState !== 1) {
        req.user = inMemoryStore.findUserById(decoded.id) || {
          _id: decoded.id,
          name: 'Demo User',
          email: 'demo@example.com'
        };
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User account not found for this token'
        });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Token has expired. Please log in again.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or malformed token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided in Authorization header'
    });
  }
};
