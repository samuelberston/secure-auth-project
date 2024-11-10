/**
 *      Protected router to demonstrate JWT authorization
 */

const jwt = require('jsonwebtoken');
const logger = require('../logger.js');

const ProtectedRouter = require('express').Router();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

    if (!token) {
        logger.warn(`Unauthorized attempt to access protected data from IP: %s`, req.ip);
        return res.status(401).json({ message: 'Token missing.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn(`Attempt to access protected data with expired JWT from IP: %s`, req.ip);
            return res.status(403).json({ message: 'Token invalid or expired.' });
        }
        req.user = user;
        next();
    });
}

ProtectedRouter.get('/', authenticateToken, (req, res) => {
    logger.info(`User %s accessed protected data from IP: %s`, req.user, req.ip);
    res.status(200).json({ data: 'This is protected data.', user: req.user });
});

module.exports = ProtectedRouter;
