const express = require('express');
const path = require('path');
const axios = require('axios');
// const { Buffer } = require('buffer');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Define constants
const PORT = 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000'; 
const app = express();

// Essential middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// API Proxy setup
console.log('Setting up proxy middleware...');

// Simple proxy configuration first - ISSUE - only works for GET requests
const proxy = createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/' // removes /api prefix when forwarding to backend
    },
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'], // not working for POST requests
    logLevel: 'debug'
});

// Mount the proxy before static files
app.use('/api', proxy);


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Proxy POST requests to backend container, since the proxy middleware is not working for POST requests
app.post('/backend/login', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/login`, req.body, {
            headers: {
                'Content-Type': 'application/json',
                ...req.headers
            }    
        });

        // Forward the response back to the client
        res.status(response.status).json(response.data);
    } catch (err) {
        console.error('Error forwarding POST request:', err);
        if (err.response) {
            // Forward the error response from the backend
            res.status(err.response.status).json(err.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/backend/users', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/users`, req.body, {
            headers: {
                'Content-Type': 'application/json',
                ...req.headers
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding POST request:', error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Serve the html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Client server running on http://localhost:${PORT}`);
    console.log('Backend URL:', BACKEND_URL);
});