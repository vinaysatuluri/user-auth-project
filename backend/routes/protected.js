// /routes/protected.js
import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Example: Protected route to test authentication
router.get('/dashboard-data', authenticateToken, (req, res) => {
  res.json({
    message: `Hello, ${req.user.username || 'user'}!`,
    info: 'This is protected dashboard data.',
  });
});

export default router;
