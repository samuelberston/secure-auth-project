// server/tests/usertest.js
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

// Import  routers
const UsersRouter = require('../routes/usersRouter.js');

// Create an Express app instance  
const app = express();

// Use middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: true, 
    cookie: { secure: false, sameSite: "Lax" } 
}));

// Use  routers
app.use('/users', UsersRouter);

let testUsername = `testuser${Math.floor(Math.random() * 1000)}`;

describe('POST /users', () => {
    beforeAll(() => {
        // reset the test username
        testUsername = `testuser${Math.floor(Math.random() * 1000)}`;
    });

    it('should create a new user with valid credentials', async () => {
        const response = await request(app)
            .post('/users')
            .send({ username: testUsername, password: 'Password1!' });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User registered successfully.');
    });

    it('should fail to create a new user with invalid credentials', async () => {
        const response = await request(app)
            .post('/users')
            .send({ username: 'testuser', password: 'password' });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Username/password do not meet requirements');
    });

    it('should fail to create a user that already exists', async () => {
        const response = await request(app)
            .post('/users')
            .send({ username: testUsername, password: 'Password1!' });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Error creating user');
    });
});
