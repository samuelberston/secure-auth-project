const express = require('express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid'); // For generating CSRF tokens
const { body, validationResult, cookie } = require('express-validator');
const cookieParser = require('cookie-parser');

const app = express();

// Security middleware
app.use(helmet()); // TO DO: configure the CSP 
app.use(express.json()); // For parsing JSON
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(cookieParser());

// Set up session management with secure cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "Strict" // prevents CSRF attacks
    }
}));

// CSRF middleware to store token in secure cookie
app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = uuidv4(); // generate a new CSRF token
    }
    res.cookie("XSRF-TOKEN", req.session.csrfToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: "Strict" // prevents CSRF attacks  
        }
    );
});

// middleware to validate CSRF token
const crsfValidation = (req, res, next) => {
    const csrfTokenFromClient = req.headers['x-xsrf-token'] || req.body._csrf;
    if (!csrfTokenFromClient || csrfTokenFromClient !== req.session.csrfToken) {
        return res.status(403).send({ message: "Invalid CSRF token" });
    }
    next();
}

// Authenticate user function

// Login endpoint with input validation and JWT session initiation
