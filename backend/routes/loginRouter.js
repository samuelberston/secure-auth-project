const bcrypt = require('bcrypt');                           // Compare password against hash
const jwt = require('jsonwebtoken');                        // Initiate JWT session
const { validationResult } = require("express-validator");  // Validate credentials
const logger = require("../logger.js");
const rateLimit = require('express-rate-limit');

// Validation middleware
const { usernameValidator, passwordValidator } = require('../validators.js');

// PostgreSQL connection
const pool = require('../psql.js');                         

const LoginRouter = require("express").Router();

// route rate limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: {
        status: 429,
        error: 'Too many login attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @route POST /login
 * @desc Handles user login, validating credentials, checking user existence in the database, verifying password, and initiating a session via JWT if successful.
 * 
 * - Validates the provided `username` and `password` using express-validator middleware.
 * - Ensures that the username and password meet defined security and format guidelines.
 * - If validation fails, responds with a 403 status and an appropriate error message.
 * 
 * Upon successful validation:
 * - Checks if the user exists in the database.
 * - If the user does not exist, responds with a 403 status and an error message indicating "Invalid credentials", to prevent sharing info that could help in flooding attacks.
 * - If the user exists, retrieves the password hash from the database and compares it with the provided password using bcrypt.
 * - If the password matches, returns a 200 status and logs "Authentication successful."
 * - If the password does not match, returns a 401 status with an error message indicating "Authentication failed."
 * 
 * In case of an internal server/database error, responds with a 500 status and logs the error.
 * 
 * @middleware
 * - usernameValidator: Ensures the username follows security rules (e.g., alphanumeric, no special characters).
 * - passwordValidator: Ensures the password meets security strength requirements (e.g., length, complexity).
 * 
 * @returns
 * - 200: If authentication is successful.
 * - 401: If the password does not match the stored hash (authentication failed).
 * - 403: If validation fails (username or password does not meet the criteria) or the user does not exist.
 * - 500: If an internal server error occurs during the authentication process.
 */
LoginRouter.post(
    '/',
    loginLimiter,
    [
        usernameValidator,
        passwordValidator
    ],
    async (req, res) => {
        // validate credentials meet requirements
        const result = validationResult(req);       
        if (!result.isEmpty()) {
            // add sleep to prevent side-channel attacks
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { username, password } = req.body;

        try {
            console.log("POST /login");
            // check user exists
            const userQuery = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1);`;
            try {
                const userRes = await pool.query(userQuery, [username]);
                if (!userRes.rows[0].exists) {
                    console.log(`User ${username} does not exist`);
                    logger.warn(`Failed login attempt with non-existent username %s from IP: %s`, username, req.ip);
                    return res.status(401).json({ message: "Invalid credentials" });
                }
            } catch (err) {
                console.error("Error checking user existence: ", err);
                logger.error(`Error checking user existence for user %s from IP: %s`, username, req.ip);
                return res.status(500).json({ message: "Error processing request" });
            }
            
            // check password
            const passwordQuery = `SELECT user_uuid, password_hash FROM users WHERE username = $1`;
            const values = [username];
            
            const hashRes = await pool.query(passwordQuery, values);

            const storedHash = hashRes.rows[0].password_hash;
            const passwordMatch = await bcrypt.compare(password, storedHash);

            if (passwordMatch) {
                const userUUID = hashRes.rows[0].user_uuid;

                // Create a JWT token with a short expiry for security
                req.session.token = jwt.sign(
                    { userId: userUUID, username: username },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' } // Token expires in 1 hour
                );

                // Store user info in session
                req.session.user = {
                    username: username,
                    userUUID: userUUID,
                    loggedInAt: new Date().toISOString()
                };

                console.log("Authentication successful");
                logger.info(`User %s successfully logged in from IP: %s`, username, req.ip);
                return res.status(200).json({ 
                    token: req.session.token,
                    message: "Authentication successful" 
                });
            } else {
                console.log("Authentication failed - Invalid credentials");
                logger.warn(`Failed login attempt from user %s from IP: %s`, username, req.ip);
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } catch (err) {
            console.error("Error during authentication: ", err);
            logger.error(`Error processing login request for user %s from IP: %s`, username, req.ip);
            return res.status(500).json({ message: "Error processing request" });
        }
    }
);

module.exports = LoginRouter;
