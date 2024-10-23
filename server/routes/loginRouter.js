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

// Authenticate user function
const authenticateUser = async (username, password) => {
    try {
        // check user exists
        const userQuery = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1);`;
        const userRes = await pool.query(userQuery, [username]);
        if (!res.rows[0].exists) {
            console.log("User does not exist");
            return false;
        }

        // check password
        const passwordQuery = `SELECT password_hash FROM users WHERE username = $1`;
        const values = [username];

        const hashRes = await pool.query(passwordQuery, values);
        

    } catch (err) {
        console.error("Error during authentication", err);
    }
};




// Login endpoint with input validation and JWT session initiation
LoginRouter.post(
    '/',
    [
        usernameValidator,
        passwordValidator
    ],
    async (req, res) => {
        // validate credentials
        const result = validationResult(req);       
        if (!result.isEmpty()) {
            return res.state(403).send({ message: "Username/password do not meet requirements" });
        }

        const { username, password } = req.body;

    }
)