const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware }= require('http-proxy-middleware');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy configuration: forward API requests to the backend server
const proxyMiddleware = createProxyMiddleware({
    target: 'http://localhost:3000', // backend server
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // Remove '/api' prefix when forwarding
    },
    secure: false, // development environment
})

app.use('/api', proxyMiddleware);

// Route to serve the registration form
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Client server running on http://localhost:${PORT}`);
});