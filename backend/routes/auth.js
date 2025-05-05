import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/authMiddleware.js';
import {
    signupHandler,
    loginHandler,
    verifyOtpHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    resendOtpHandler,
    updateEmailHandler
} from '../controllers/authController.js';

const router = Router();

// Rate limiter for email update endpoint to prevent abuse
const updateEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 requests per window
    message: 'Too many email update attempts, please try again later.',
});

// Public Auth Routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/resend-otp', resendOtpHandler);
router.post('/update-email', updateEmailLimiter, updateEmailHandler); // Add rate limiting

// Protected Route Example
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Profile fetched successfully', user: req.user });
});

export default router;