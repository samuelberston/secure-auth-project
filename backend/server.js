const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv')
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

dotenv.config();

const UsersRouter = require("./routes/usersRouter.js");
const LoginRouter = require("./routes/loginRouter.js");
const ProtectedRouter = require("./routes/protectedRouter.js");
const AdviceRouter = require("./routes/adviceRouter.js");

const app = express();

// Root Endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Auth server is up and running.' });
  });
  
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
})

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
    origin: 'http://localhost:8081', // development client server's origin
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Authorization", "Origin", "X-Requested-With", "Content-Type", "Accept", "data", "body", "X-XSRF-TOKEN"],
    credentials: true, // Allow cookies to be sent and received
    optionsSuccessStatus: 200
}));

// Set up session management with secure cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, // for development
        sameSite: "Lax"
    }
}));

// Route to initialize session
app.get('/init-session', (req, res) => {
    console.log('Session ID: ', req.cookies['connect.sid']);
    res.sendStatus(200); // Respond with OK status
});

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

// routes
app.use('/users', UsersRouter);
app.use('/login', loginLimiter, LoginRouter);
app.use('/protected', ProtectedRouter);
app.use('/advice', AdviceRouter);

module.exports = app; // export for testing
