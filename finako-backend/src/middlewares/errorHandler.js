// Enhanced error handler middleware
module.exports = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong on our end'
  };

  // Handle specific error types
  if (err.code) {
    // Supabase/PostgreSQL errors
    switch (err.code) {
      case 'PGRST116': // Not found
        statusCode = 404;
        errorResponse = {
          success: false,
          error: 'Not Found',
          message: 'The requested resource was not found'
        };
        break;
      case '23505': // Unique constraint violation
        statusCode = 409;
        errorResponse = {
          success: false,
          error: 'Conflict',
          message: 'Resource already exists'
        };
        break;
      case '23503': // Foreign key constraint violation
        statusCode = 400;
        errorResponse = {
          success: false,
          error: 'Invalid Reference',
          message: 'Referenced resource does not exist'
        };
        break;
      case '42P01': // Table does not exist
        statusCode = 500;
        errorResponse = {
          success: false,
          error: 'Database Error',
          message: 'Database configuration error'
        };
        break;
      default:
        if (err.message) {
          errorResponse.message = err.message;
        }
    }
  } else if (err.name) {
    // Handle common JavaScript errors
    switch (err.name) {
      case 'ValidationError':
        statusCode = 400;
        errorResponse = {
          success: false,
          error: 'Validation Error',
          message: err.message,
          details: err.details || null
        };
        break;
      case 'UnauthorizedError':
        statusCode = 401;
        errorResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        };
        break;
      case 'ForbiddenError':
        statusCode = 403;
        errorResponse = {
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions'
        };
        break;
      default:
        if (err.message) {
          errorResponse.message = err.message;
        }
    }
  } else if (err.status || err.statusCode) {
    // Express/HTTP errors
    statusCode = err.status || err.statusCode;
    errorResponse.message = err.message || 'Request failed';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'Internal Server Error';
  }

  // Add request ID for tracking (if you implement request ID middleware)
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  res.status(statusCode).json(errorResponse);
};
