/**
 *      Protected router to demonstrate JWT authorization
 */

const jwt = require('jsonwebtoken');
const ProtectedRouter = require('express').Router();

ProtectedRouter.get('/protected', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: 'Protected Data', user: decoded });
    } catch (err) {
        res.status(403).json({ message: 'Unauthorized' });
    }
});

module.exports = ProtectedRouter;
