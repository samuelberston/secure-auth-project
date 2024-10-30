const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require("cors");
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

// Enable requests from client
app.use(cors({
    origin: 'http://localhost:8081', // Your client server's origin
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

// debugging
app.use((req, res, next) => {
    console.log('Session ID:', req.session.id);
    console.log('Session:', req.session);
    next();
});

// Route to initialize session and CSRF token - notice CSRF middleware not used here
app.get('/init-session', (req, res) => {
    res.sendStatus(200); // Respond with OK status
});

// routes
app.use('/users', UsersRouter);
app.use('/login', LoginRouter);
app.use('/protected', ProtectedRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:3000');
});
