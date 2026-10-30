/**
 * Content-Type Verification Middleware
 */
export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        error: 'Unsupported Media Type',
        message: 'Content-Type header must be application/json for POST, PUT, and PATCH requests'
      });
    }
  }
  next();
};
