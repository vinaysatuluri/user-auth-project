// routes/auth.js
import { Router } from 'express';
import {
  signupHandler,
  loginHandler,
  verifyOtpHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from '../controllers/authController.js';

const router = Router();

router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

export default router;
