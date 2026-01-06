/**
 * Response Middleware - Standardizes API responses across the application
 * Provides consistent response format for success and error cases
 */

/**
 * Standard response format:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any,
 *   timestamp: string,
 *   statusCode: number
 * }
 */

/**
 * Extends Express response object with helper methods
 */
export const responseMiddleware = (req, res, next) => {
  /**
   * Send a successful response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  res.success = (data = null, message = 'Operation successful', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    });
  };

  /**
   * Send a created response (201)
   * @param {any} data - Response data
   * @param {string} message - Success message
   */
  res.created = (data = null, message = 'Resource created successfully') => {
    return res.success(data, message, 201);
  };

  /**
   * Send a no content response (204)
   */
  res.noContent = () => {
    return res.status(204).send();
  };

  /**
   * Send an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {any} errors - Additional error details
   */
  res.error = (message = 'An error occurred', statusCode = 400, errors = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  };

  /**
   * Send a not found response (404)
   * @param {string} message - Error message
   */
  res.notFound = (message = 'Resource not found') => {
    return res.error(message, 404);
  };

  /**
   * Send an unauthorized response (401)
   * @param {string} message - Error message
   */
  res.unauthorized = (message = 'Unauthorized access') => {
    return res.error(message, 401);
  };

  /**
   * Send a forbidden response (403)
   * @param {string} message - Error message
   */
  res.forbidden = (message = 'Forbidden access') => {
    return res.error(message, 403);
  };

  /**
   * Send a bad request response (400)
   * @param {string} message - Error message
   * @param {any} errors - Validation errors
   */
  res.badRequest = (message = 'Bad request', errors = null) => {
    return res.error(message, 400, errors);
  };

  /**
   * Send a conflict response (409)
   * @param {string} message - Error message
   */
  res.conflict = (message = 'Resource conflict') => {
    return res.error(message, 409);
  };

  /**
   * Send an internal server error response (500)
   * @param {string} message - Error message
   * @param {any} error - Error details (only in development)
   */
  res.serverError = (message = 'Internal server error', error = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 500
    };

    // Only include error details in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.message || error;
      response.stack = error.stack;
    }

    return res.status(500).json(response);
  };

  /**
   * Send a validation error response (422)
   * @param {string} message - Error message
   * @param {any} errors - Validation errors
   */
  res.validationError = (message = 'Validation failed', errors = null) => {
    return res.error(message, 422, errors);
  };

  next();
};

/**
 * Error handler middleware - Catches unhandled errors
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.validationError('Validation failed', errors);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.conflict('Resource already exists');
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.serverError('Database error occurred');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return res.unauthorized('Token expired');
  }

  // Handle custom errors with status code
  if (err.statusCode) {
    return res.error(err.message, err.statusCode, err.errors);
  }

  // Default error response
  return res.serverError(err.message || 'Internal server error', err);
};

/**
 * 404 handler - Catch all unmatched routes
 */
export const notFoundHandler = (req, res) => {
  res.notFound(`Route ${req.method} ${req.originalUrl} not found`);
};

