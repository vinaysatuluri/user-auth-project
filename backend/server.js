import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // Correct path
import protectedRoutes from './routes/protected.js';
import authenticateToken from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Mount authRoutes at /api/auth
app.use('/api', protectedRoutes);

// Protected route example
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Profile fetched successfully', user: req.user });
});

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
