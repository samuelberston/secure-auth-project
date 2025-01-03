const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv')
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

dotenv.config(); // remove - unused in container environment

const UsersRouter = require("./routes/usersRouter.js");
const LoginRouter = require("./routes/loginRouter.js");
const ProtectedRouter = require("./routes/protectedRouter.js");
const AdviceRouter = require("./routes/adviceRouter.js");

const app = express();

// Root Endpoint
app.get('/', (req, res, next) => {
    try {
        res.status(200).json({ message: 'Auth server is up and running.' });
    } catch (err) {
        next(err);
    }
});
  
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Global rate limiter
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        error: 'Too many requests, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));

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

// Enable requests from client
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:80", // development client server's origin
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Origin", "X-Requested-With", "Content-Type", "Accept", "data", "body", "X-XSRF-TOKEN"],
    credentials: true, // Allow cookies to be sent and received
    optionsSuccessStatus: 200
}));

// trigger preflight request
app.options('*', cors());

// Set up session management with secure cookies
app.use(session({
    secret: process.env.SESSION_SECRET || 'secure-development-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, // for development
        sameSite: "Lax",
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Route to initialize session
app.get('/init-session', (req, res) => {
    console.log('Session ID: ', req.cookies['connect.sid']);
    res.sendStatus(200); // Respond with OK status
});

// routes
app.use('/users', UsersRouter);
app.use('/login', LoginRouter);
app.use('/protected', ProtectedRouter);
app.use('/advice', AdviceRouter);

module.exports = app; // export for testing
