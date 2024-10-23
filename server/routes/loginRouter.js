/** 
 *      /login route
 * 
 * 
*/

const bcrypt = require('bcrypt');
const { body, validationResult } = require("express-validator");

const { usernameValidator, passwordValidator } = require('../validators.js');

const LoginRouter = require("express").Router();

// PostgreSQL connect
const pool = require('./db');

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
 * - If the user does not exist, responds with a 403 status and an error message indicating "User does not exist."
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
 * 
 * @dependencies
 * - bcrypt: Used for comparing the stored password hash with the provided password.
 * - express-validator: Used for input validation (username and password).
 * - pool: Database connection pool for querying user data.
 */
LoginRouter.post(
    '/login',
    [
        usernameValidator,
        passwordValidator
    ],
    async (req, res) => {
        // validate credentials
        const result = validationResult(req);       
        if (!result.isEmpty()) {
            return res.status(403).send({ message: "Invalid username/password" });
        }

        const { username, password } = req.body;

        try {
            // check user exists
            const userQuery = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1);`;
            const userRes = await pool.query(userQuery, [username]);
            if (!res.rows[0].exists) {
                console.log("User does not exist");
                // consider adding sleep to prevent sidechannel attacks
                res.send(403).send({ message: "Invalid username/password"} );
            }
    
            // check password
            const passwordQuery = `SELECT password_hash FROM users WHERE username = $1`;
            const values = [username];
    
            const hashRes = await pool.query(passwordQuery, values);

            if (hashRes.rows.length) {
                const storedHash = hashRes.rows[0].password_hash;
                const passwordMatch = bcrypt.compare(password, storedHash);

                if (passwordMatch) {
                    console.log("Authentication successful");
                    res.status(200).send("Authentication successful")
                } else {
                    console.log("Authentication failed");
                    res.status(401).send("Authentication failed");
                }
            }
        } catch (err) {
            console.error("Error during authentication: ", err);
            res.status(500).send("Error processing request");
        }
    }
);

module.exports = LoginRouter;