/**
 * Centralized Error Handling Middlewares
 */

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: 'Duplicate Key Error',
      message: `A record with that ${field} already exists`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: 'Database Validation Error',
      details: messages
    });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Identifier',
      message: `Resource not found with ID: ${err.value}`
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
