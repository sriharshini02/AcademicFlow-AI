import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.unauthorized('No token provided');
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.unauthorized('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    req.user = { user_id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.forbidden('Failed to authenticate token');
  }
};
