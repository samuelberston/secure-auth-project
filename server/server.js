const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid'); // For generating CSRF tokens
const cookieParser = require('cookie-parser');
const cors = require("cors");
const csurf = require('csurf');
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

// csurf
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    }
});

// CSRF middleware to store token in secure cookie
// app.use((req, res, next) => {
//     try {
//         if (!req.session.csrfToken) {
//             req.session.csrfToken = uuidv4(); // generate a new CSRF token
//         }
//         res.cookie("XSRF-TOKEN", req.session.csrfToken, {
//             secure: false, // for development
//             sameSite: "Lax" // Allows cookies to be sent with top-level navigation GET requests (suitable for initial requests).  
//         });
//         next();
//     } catch (err) {
//         next(err);
//     }
// });

// middleware to validate CSRF token
// const csrfValidation = (req, res, next) => {
//     try {
//         const csrfTokenFromClient = req.headers["X-XSRF-TOKEN"] || req.body._csrf;
//         console.log('Received CSRF Token:', csrfTokenFromClient);
//         console.log('Session CSRF Token:', req.session.csrfToken);
//         if (!csrfTokenFromClient || csrfTokenFromClient !== req.session.csrfToken) {
//             console.log("csrf token: ", csrfTokenFromClient);
//             console.log("req.session.csrfToken: ", req.session.csrfToken);
//             return res.status(403).send({ message: "Invalid CSRF token" });
//         }
//         next();
//     } catch (err) {
//         next(err);
//     }
// };

// debugging
app.use((req, res, next) => {
    console.log('Session ID:', req.session.id);
    console.log('Session:', req.session);
    next();
});

// Route to initialize session and CSRF token - notice CSRF middleware not used here
app.get('/init-session', (req, res) => {
    // The CSRF middleware will run before this route handler
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
