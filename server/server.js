const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid'); // For generating CSRF tokens
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv')
dotenv.config();

const UsersRouter = require("./routes/usersRouter.js");
const LoginRouter = require("./routes/loginRouter.js");
const ProtectedRouter = require("./routes/protectedRouter.js");

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "base-uri": ["'self'"],
          "script-src": ["'self'"],
          "form-action": ["'self'"],
          "frame-ancestors": ["'self'"],
          "object-src": ["'none'"],
          "script-src-attr": ["'none'"],
        //   "upgrade-insecure-requests": 1 // uncomment for prod
        },
    },    
    strictTransportSecurity: process.env.NODE_END === "production"
}));
app.use(express.json()); // For parsing JSON
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(cookieParser());

// error handling middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Set up session management with secure cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict" // prevents CSRF attacks
    }
}));

// CSRF middleware to store token in secure cookie
app.use((req, res, next) => {
    try {
        if (!req.session.csrfToken) {
            req.session.csrfToken = uuidv4(); // generate a new CSRF token
        }
        res.cookie("XSRF-TOKEN", req.session.csrfToken,
            {
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict" // site cannot be accessed from other sites  
            }
        );
        next();
    } catch (err) {
        next(err);
    }
});

// middleware to validate CSRF token
const csrfValidation = (req, res, next) => {
    try {
        const csrfTokenFromClient = req.headers['x-xsrf-token'] || req.body._csrf;
        if (!csrfTokenFromClient || csrfTokenFromClient !== req.session.csrfToken) {
            return res.status(403).send({ message: "Invalid CSRF token" });
        }
    } catch (err) {
        next(err);
    }
};

// dummy home page
app.get('/home', (req, res) => {
    res.json({ message: 'Hello' });
});

// routes
app.use('/', csrfValidation, UsersRouter);
app.use('/', csrfValidation, LoginRouter);
app.use('/', csrfValidation, ProtectedRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:3000');
});
