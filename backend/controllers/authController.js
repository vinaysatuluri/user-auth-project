import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// --- SEND OTP ---
export const sendOtpEmail = async (email, otp) => {
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
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent to ${email}: ${otp}`, info);
    } catch (err) {
        console.error('❌ Error sending OTP email:', err);
        throw new Error('Failed to send OTP');
    }
};

// --- SIGN UP ---
export const signupHandler = async (req, res) => {
    const { first_name, middle_name, last_name, username, email, password, phone } = req.body;

    console.log('Signup Request Body:', req.body);

    // --- Backend Validation ---
    if (!first_name || !first_name.trim()) {
        return res.status(400).json({ error: 'First name is required' });
    }
    if (!last_name || !last_name.trim()) {
        return res.status(400).json({ error: 'Last name is required' });
    }
    if (!username || !username.trim()) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!phone || !phone.trim()) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiry

        await pool.query(
            'INSERT INTO users (first_name, middle_name, last_name, username, email, password_hash, phone, otp, otp_expiry, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
            [first_name, middle_name, last_name, username, email, hashedPassword, phone, otp, expiry]
        );

        try {
            await sendOtpEmail(email, otp);
            res.status(201).json({ message: 'User created. OTP sent to email for verification.' });
        } catch (otpError) {
            console.error('⚠️ Error sending OTP after signup:', otpError);
            res.status(500).json({ error: 'User created, but failed to send OTP. Please try again later.' });
        }
    } catch (err) {
        console.error('❌ Signup error:', err);
        res.status(500).json({ error: 'Error signing up user' });
    }
};

// --- LOGIN ---
export const loginHandler = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    console.log('Login Request Body:', req.body);

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [usernameOrEmail, usernameOrEmail]
        );

        console.log('Login Query Result:', rows);

        if (rows.length === 0) {
            console.log('Login: Invalid credentials - User not found');
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log('Login: Invalid credentials - Password mismatch');
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            console.log('Login: Email not verified for user:', user.email);
            return res.status(401).json({ error: 'Email not verified. Please verify your email first.' });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.user_id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
            },
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ error: 'Error logging in' });
    }
};

// --- VERIFY OTP ---
export const verifyOtpHandler = async (req, res) => {
    const { email, otp, purpose } = req.body;
    console.log(`Attempting to verify OTP for email: ${email}, received OTP: ${otp}, purpose: ${purpose}`);

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'Email not found' });

        const user = rows[0];
        console.log("User data from database:", user);
        console.log(`Stored OTP: ${user.otp}, OTP Expiry: ${user.otp_expiry}`);

        if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (purpose === 'signup') {
            await pool.query(
                'UPDATE users SET isVerified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?',
                [email]
            );
            res.json({ message: 'Email verified successfully' });
        } else if (purpose === 'reset-password') {
            const resetToken = uuidv4();
            const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
            await pool.query(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
                [resetToken, resetTokenExpiry, email]
            );
            res.json({ message: 'OTP verified successfully. You can now reset your password.', token: resetToken });
        } else {
            return res.status(400).json({ error: 'Invalid verification purpose' });
        }
    } catch (err) {
        console.error('❌ Verify OTP error:', err);
        res.status(500).json({ error: 'Error verifying OTP' });
    }
};

// --- FORGOT PASSWORD ---
export const forgotPasswordHandler = async (req, res) => {
    const { email } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'Email not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, expiry, email]);

        console.log(`🔑 OTP generated for ${email}: ${otp}, expires at: ${expiry}`);
        await sendOtpEmail(email, otp);
        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error('❌ Forgot password error:', err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// --- RESET PASSWORD ---
export const resetPasswordHandler = async (req, res) => {
    const { email, token, newPassword } = req.body;
    console.log("Reset Password Handler called with:", { email, token, newPassword });

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and contain both letters and numbers.'
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'Email not found' });

        const user = rows[0];

        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
            return res.status(400).json({ error: 'The old password and new password should not be same' });
        }

        if (!user.reset_token || user.reset_token !== token || new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('❌ Reset password error:', err);
        res.status(500).json({ error: 'Error resetting password' });
    }
};

// --- RESEND OTP ---
export const resendOtpHandler = async (req, res) => {
    const { email } = req.body;

    console.log('Resend OTP: Received request for email:', email);

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('Resend OTP: Database query result:', rows);

        if (rows.length === 0) {
            console.log('Resend OTP: Email NOT found in database:', email);
            return res.status(404).json({ error: 'Email not found' });
        }

        const user = rows[0];
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newExpiry = new Date(Date.now() + 15 * 60 * 1000);

        console.log('Resend OTP: User found for email:', email, 'User data:', user);
        console.log('Resend OTP: New OTP generated:', newOtp, 'Expiry:', newExpiry);

        const [updateResult] = await pool.query(
            'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?',
            [newOtp, newExpiry, email]
        );

        console.log('Resend OTP: Database update result:', updateResult);

        if (updateResult.affectedRows === 0) {
            console.error('Resend OTP: Database update failed (affectedRows = 0) for email:', email);
            return res.status(500).json({ error: 'Failed to update OTP in database' });
        }

        console.log('Resend OTP: Attempting to send new OTP email...');
        try {
            const info = await sendOtpEmail(email, newOtp);
            console.log('Resend OTP: Email sent successfully', info);
            res.json({ message: 'New OTP sent to your email' });
        } catch (otpError) {
            console.error('❌ Error sending resend OTP email:', otpError);
            res.status(500).json({ error: 'Failed to resend OTP email' });
        }
    } catch (dbError) {
        console.error('❌ Resend OTP database query error:', dbError);
        res.status(500).json({ error: 'Error resending OTP' });
    }
};

// --- UPDATE EMAIL ---
export const updateEmailHandler = async (req, res) => {
    const { oldEmail, newEmail } = req.body;

    console.log('Update Email: Received request:', { oldEmail, newEmail });

    // --- Validation ---
    if (!oldEmail || !newEmail) {
        console.log('Update Email: Missing oldEmail or newEmail');
        return res.status(400).json({ error: 'Old and new email are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        console.log('Update Email: Invalid new email format:', newEmail);
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (oldEmail === newEmail) {
        console.log('Update Email: Old and new email are the same:', oldEmail);
        return res.status(400).json({ error: 'New email must be different from the old email' });
    }

    try {
        // Check if the new email is already in use
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [newEmail]);
        if (existing.length > 0) {
            console.log('Update Email: New email already in use:', newEmail);
            return res.status(409).json({ error: 'Email already in use' });
        }

        // Check if the old email exists
        const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [oldEmail]);
        if (userRows.length === 0) {
            console.log('Update Email: Old email not found:', oldEmail);
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newExpiry = new Date(Date.now() + 15 * 60 * 1000);

        // Update email and OTP
        const [updateResult] = await pool.query(
            'UPDATE users SET email = ?, otp = ?, otp_expiry = ? WHERE email = ?',
            [newEmail, newOtp, newExpiry, oldEmail]
        );

        if (updateResult.affectedRows === 0) {
            console.error('Update Email: Database update failed (affectedRows = 0) for oldEmail:', oldEmail);
            return res.status(500).json({ error: 'Failed to update email in database' });
        }

        console.log('Update Email: Email updated successfully, sending new OTP to:', newEmail);

        // Send OTP to the new email
        try {
            await sendOtpEmail(newEmail, newOtp);
            res.json({ message: 'Email updated successfully, new OTP sent to your email' });
        } catch (otpError) {
            console.error('❌ Error sending OTP after email update:', otpError);
            // Roll back the email update if OTP sending fails (optional, depending on your requirements)
            await pool.query('UPDATE users SET email = ?, otp = NULL, otp_expiry = NULL WHERE email = ?', [oldEmail, newEmail]);
            res.status(500).json({ error: 'Email updated, but failed to send OTP. Please try again.' });
        }
    } catch (err) {
        console.error('❌ Update email error:', err);
        res.status(500).json({ error: 'Error updating email' });
    }
};