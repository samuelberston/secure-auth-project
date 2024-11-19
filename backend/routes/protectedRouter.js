/**
 *      Protected router to demonstrate JWT authorization
 */

const jwt = require('jsonwebtoken');
const logger = require('../logger.js');
const rateLimit = require('express-rate-limit');

const ProtectedRouter = require('express').Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Validate JWT_SECRET at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

    if (!token || !/^[\w-]*\.[\w-]*\.[\w-]*$/.test(token)) {
        logger.warn(`Invalid token format from IP: ${req.ip}`);
        return res.status(401).json({ message: 'Invalid authentication' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn(`JWT verification failed from IP: ${req.ip}`);
            return res.status(403).json({ message: 'Token invalid or expired.' });
        }
        // Only store necessary user data
        req.user = {
            id: user.id,
            role: user.role
        };
        next();
    });
}

ProtectedRouter.get('/', 
    authLimiter,
    authenticateToken, 
    (req, res) => {
        logger.info(`User %s accessed protected data from IP: %s`, req.user, req.ip);
        res.status(200).json({ 
            data: 'This is protected data.', 
            user: req.user.id 
        });
    }
);

module.exports = ProtectedRouter;
