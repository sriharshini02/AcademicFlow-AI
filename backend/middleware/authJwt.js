import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    req.user = { user_id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Failed to authenticate token' });
  }
};
