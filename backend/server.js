// Importing necessary modules
import express from 'express';  // Correctly importing Express
import cors from 'cors';  // Importing CORS for cross-origin requests
import dotenv from 'dotenv';  // Importing dotenv for managing environment variables
import jwt from 'jsonwebtoken';  // Importing JWT for token-based authentication
import authRoutes from './routes/auth.js';  // Correctly importing auth routes
import protectedRoutes from './routes/protected.js';  // Importing protected routes

dotenv.config();  // Load environment variables from .env file

const app = express();  // Initialize an Express app

// Middleware
const cors = require('cors');
app.use(cors());  // Enabling CORS to handle cross-origin requests
app.use(express.json());  // Middleware to parse JSON request bodies

// JWT verification middleware for profile route
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });  // Return 401 if no token is found
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the JWT token using the secret key
    req.user = decoded;  // Attach decoded user data to the request
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token.' });  // Return 400 if token is invalid or expired
  }
};

// Mount routes (Update this line to '/api/auth')
app.use('/api/auth', authRoutes);  // All auth routes will be prefixed with /api/auth
app.use('/api', protectedRoutes);  // Assuming protected routes are under /api

// Profile route (protected by JWT token)
app.get('/api/auth/profile', verifyToken, (req, res) => {  // Profile route that requires token verification
  res.json({ message: 'Profile fetched successfully', user: req.user });  // Send profile data as response
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('API is running...');  // Simple message to indicate the API is working
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log error stack for debugging
  res.status(500).json({ error: 'Something went wrong!' });  // Send a generic error response
});

// Start the server
const PORT = process.env.PORT || 5000;  // Use the port from environment or default to 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);  // Log server running confirmation
});
