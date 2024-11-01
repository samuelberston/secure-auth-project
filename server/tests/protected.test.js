// server/tests/protected.test.js
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

const ProtectedRouter = require('../routes/protectedRouter.js');
const LoginRouter = require('../routes/loginRouter.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: "Lax" }
}));

// Use routers
app.use('/protected', ProtectedRouter);
app.use('/login', LoginRouter);

describe('GET /protected', () => {
    let token;

    // login to get token
    beforeAll(async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'flarbene', password: 'Flarbene123!' });
        token = response.body.token;
    });

    // test protected route
    it('should access protected route with valid token', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBe('This is protected data.');
        expect(response.body.user).toBeDefined();
    });
});