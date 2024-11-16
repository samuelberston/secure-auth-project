const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000'; 

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy configuration: forward API requests to the backend server
const proxyMiddleware = createProxyMiddleware({
    target: BACKEND_URL, // backend server
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // Remove '/api' prefix when forwarding
    },
    secure: false, // development environment
})

app.use('/api', proxyMiddleware);

// Serve the html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Client server running on http://localhost:${PORT}`);
});