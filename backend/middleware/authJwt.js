import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  console.log("Auth header in middleware:", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token extracted:", token);
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
    req.userId = decoded.id; // attach HOD ID from token
    req.role = decoded.role;
    req.user = { user_id: decoded.id, role: decoded.role };

    next();
  });
};
