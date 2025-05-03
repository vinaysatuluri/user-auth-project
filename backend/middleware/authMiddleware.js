// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
  
  // Check if token is missing
  if (!token) {
    return res.status(401).json({ error: 'Token is required' }); // Return 401 if no token
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' }); // Return 401 if the token is invalid or expired
  }
};

export default authenticateToken;
