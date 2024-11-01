// backend/tests/login.test.js
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

// Import your routers
const LoginRouter = require('../routes/loginRouter.js');
const UsersRouter = require('../routes/usersRouter.js');
const ProtectedRouter = require('../routes/protectedRouter.js');

// Create an Express app instance
const app = express();

// custom memory store for testing
class CustomMemoryStore extends session.MemoryStore {
    close() {
        clearInterval(this.interval);
    }
}
const store = new CustomMemoryStore();

// Use middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: true, 
    cookie: { secure: false, sameSite: "Lax" },
    store: store
}));


// Use your routers
app.use('/login', LoginRouter);
app.use('/users', UsersRouter);
app.use('/protected', ProtectedRouter);

// After all tests, close the session store to clear the interval
afterAll(() => {
    store.close();
});

// Test the login route
describe('POST /login', () => {
    it('should loging successfully with valid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'flarbene', password: 'Flarbene123!' })

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Authentication successful');
        expect(response.body).toHaveProperty('token');
    });

    it('should fail login with invalid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'user1', password: 'wrongpassword' });
        
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Invalid credentials');
    });
});
