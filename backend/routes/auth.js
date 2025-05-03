// routes/auth.js
import { Router } from 'express';  // Correctly importing Router from express
import authenticateToken from '../middleware/authMiddleware.js';  // Correct path to the middleware
import {
  signupHandler,
  loginHandler,
  verifyOtpHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from '../controllers/authController.js';  // Correctly importing handler functions from the controller

const router = Router();  // Creating an Express router instance

// 🔐 Public Auth Routes
router.post('/signup', signupHandler);  // Handles POST request for user signup
router.post('/login', loginHandler);  // Handles POST request for user login
router.post('/verify-otp', verifyOtpHandler);  // Handles POST request for verifying OTP (for password reset)
router.post('/forgot-password', forgotPasswordHandler);  // Handles POST request for sending OTP to email
router.post('/reset-password', resetPasswordHandler);  // Handles POST request for resetting password with OTP

// 🔒 Protected Route Example
router.get('/profile', authenticateToken, (req, res) => {  // Uses authenticateToken middleware to protect this route
  res.json({ message: 'Profile fetched successfully', user: req.user });  // Responds with a success message and user data
});

export default router;  // Export the router to be used in server.js
