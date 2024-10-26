const express = require('express');
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files - if I add CSS later on
app.use(express.static('public'));

// Route to serve the registration form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission to register a user
app.post('/users', async (req, res) => {
    try {
        console.log("POST /users");
        // Retrieve the CSRF token from cookies
        const csrfToken = req.cookies['XSRF-TOKEN'];
        if (!csrfToken) {
            return res.status(403).send('CSRF token not found.');
        }

        // Prepare user data and include the CSRF token
        const userData = {
            username: req.body.username,
            password: req.body.password,
            _csrf: csrfToken // Include CSRF token in the body
        };

        // Make a POST request to the backend server
        const response = await axios.post('http://localhost:3000/users', userData, {
            headers: {
                'Content-Type': 'application/json',
                'x-xsrf-token': csrfToken, // Include CSRF token in headers
                'Cookie': `connect.sid=${req.cookies['connect.sid']}` // Include session cookie
            },
            withCredentials: true
        });

        res.send('User registered successfully!');
    } catch (error) {
        console.error('Error registering user:', error.response ? error.response.data : error.message);
        res.status(500).send('Error registering user.');
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log("POST /login");

        // Retrieve the CSRF token from cookies
        const csrfToken = req.cookies['XSRF-TOKEN'];
        if (!csrfToken) {
            return res.status(403).send('CSRF token not found.');
        }

        // Prepare user data and include the CSRF token
        const userData = {
            username: req.body.username,
            password: req.body.password,
            _csrf: csrfToken // Include CSRF token in the body
        };

        const response = await axios.post('http://localhost:3000/login', userData, {
            headers: {
                'Content-Type': 'application/json',
                'x-xsrf-token': csrfToken, // Include CSRF token in headers
                'Cookie': `connect.sid=${req.cookies['connect.sid']}` // Include session cookie
            },
            withCredentials: true
        });
        res.send('Logged in');
    } catch (error) {
        console.error('Error logging in:', error.response ? error.response.data : error.message);
        res.status(500).send('Error logging in.');
    }
});

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Client server running on http://localhost:${PORT}`);
});
