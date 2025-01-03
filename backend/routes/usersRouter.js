/**
 *      Users route
 */

const { v4: uuidv4 } = require('uuid');                     // Generate user UUID
const { validationResult } = require('express-validator');  // Validate credentials
const logger = require('../logger.js');
const pool = require('../psql.js');                         // PostgreSQL connection
const rateLimit = require('express-rate-limit');

const UsersRouter = require('express').Router();

const { usernameValidator, passwordValidator } = require('../validators');

// Hash the password with salt
const bcrypt = require('bcrypt');
const saltRounds = 10; 

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
};

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: "Too many accounts created from this IP, please try again after an hour"
});

/**
 * @route POST /users
 * @desc Creates a new user in the system by accepting a username and password, validates them, and stores the user in the database.
 * 
 * - Validates the provided `username` and `password` using express-validator middleware.
 * - Ensures that the username meets security and format guidelines and that the password follows secure password policies (as per OWASP).
 * - If validation fails, responds with a 403 status and an appropriate error message.
 * 
 * Upon successful validation:
 * - Hashes the password using a secure method and generates a unique user UUID.
 * - Inserts the user data (UUID, username, hashed password, and salt) into the database.
 * - If the database operation is successful, returns a 201 status indicating that the user was created successfully.
 * - In case of a server/database error, responds with a 500 status and an error message.
 * 
 * @middleware
 * - usernameValidator: Ensures the username follows defined security rules.
 * - passwordValidator: Ensures the password meets security strength requirements.
 * 
 * @returns
 * - 201: If the user was created successfully.
 * - 403: If validation fails (username or password does not meet the criteria).
 * - 500: If an internal server error occurs while creating the user.
 */
UsersRouter.post(
    '/',
    createAccountLimiter,
    [
      usernameValidator,
      passwordValidator
    ],
    async (req, res, next) => {
        console.log("POST /users");
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ message: "Username/password do not meet requirements" });
        }

        const { username, password } = req.body;

        try {
          // check if user already exists
          const userQuery = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1);`;
          const userRes = await pool.query(userQuery, [username]);

          if (userRes.rows[0].exists) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              logger.warn(`Duplicate registration attempt for user %s from IP %s`, username, req.ip);
              return res.status(409).json({ message: "Error creating user"} );
          }

          const { salt, hash } = await hashPassword(password);
          const user_uuid = uuidv4();
          
          const query = `INSERT INTO users (user_uuid, username, password_hash, salt) VALUES ($1, $2, $3, $4) RETURNING user_uuid`;
          const values = [user_uuid, username, hash, salt];
        
          const result = await pool.query(query, values);

          logger.info(`Registered user %s from IP: %s with ID: %s`, username, req.ip, result.rows[0].user_uuid);
          return res.status(201).json({ message: "User registered successfully." });

        } catch (err) {
          logger.error(`Error while creating user %s from IP: %s. Error: %s`, username, req.ip, err);
          return next(err);
        }
    }
);

module.exports = UsersRouter;
