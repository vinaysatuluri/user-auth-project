import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = Router();

// Send OTP via Sendinblue SMTP
const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com',
      port: 587,
      auth: {
        user: process.env.SENDINBLUE_EMAIL_USER,
        pass: process.env.SENDINBLUE_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Student" <vinaysatuluri12@gmail.com>',  
      to: 'vinaysatuluri123@gmail.com',    
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
  } catch (err) {
    console.error('❌ Error sending OTP email:', err);
    throw new Error('Failed to send OTP');
  }
};

// --- SIGN UP ---
router.post('/signup', async (req, res) => {
  const { first_name, middle_name, last_name, username, email, password, phone } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email or username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      'INSERT INTO users (first_name, middle_name, last_name, username, email, password_hash, phone, otp, otp_expiry, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW() + INTERVAL 15 MINUTE, 0)',
      [first_name, middle_name, last_name, username, email, hashedPassword, phone, otp]
    );

    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'User created. OTP sent to email for verification.' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ error: 'Error signing up user' });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.isVerified) return res.status(401).json({ error: 'Email not verified' });

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// --- VERIFY OTP ---
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Email not found' });

    const user = rows[0];
    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE users SET isVerified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?', [email]);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('❌ Verify OTP error:', err);
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Email not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      'UPDATE users SET otp = ?, otp_expiry = NOW() + INTERVAL 15 MINUTE WHERE email = ?',
      [otp, email]
    );

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// --- RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Email not found' });

    const user = rows[0];
    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, otp = NULL, otp_expiry = NULL WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

export default router;
