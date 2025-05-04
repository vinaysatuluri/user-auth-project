import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; // Import dotenv to use process.env

dotenv.config(); // Load environment variables from .env file

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract token, handle missing header

    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    try {
        // Verify token using the JWT secret from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded user information to the request
        next(); // Call the next middleware or route handler
    } catch (error) {
        // Handle different verification errors (optional, but good practice)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        } else {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
};

export default authenticateToken;
