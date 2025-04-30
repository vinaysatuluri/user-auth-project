import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Importing JWT to verify token
import authRoutes from './routes/auth.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// JWT verification middleware for profile route
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to the request
    next(); // Pass control to the next handler
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

// Mount routes
app.use('/auth', authRoutes); // All auth endpoints will be prefixed with /auth

// Profile route (protected by JWT token)
app.get('/auth/profile', verifyToken, (req, res) => {
  res.json({ message: 'Profile fetched successfully', user: req.user });
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
