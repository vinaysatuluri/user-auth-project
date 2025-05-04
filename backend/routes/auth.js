import { Router } from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import {
    signupHandler,
    loginHandler,
    verifyOtpHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    resendOtpHandler
} from '../controllers/authController.js';

const router = Router();

// Public Auth Routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/resend-otp', resendOtpHandler); // ADD THIS ROUTE

// Protected Route Example
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Profile fetched successfully', user: req.user });
});

export default router;
