// frontend/tests/app.test.js
import { fireEvent, getByLabelText } from '@testing-library/dom';

// Mock axios
jest.mock('axios', () => ({
    post: jest.fn()
}));

// import axios after mocking
import axios from 'axios';

import app from '../public/app.js';
const { handleLogin, handleRegistration, accessProtected } = app;

describe('Frontend Application Tests', () => {
    beforeEach(() => {
        // Reset mocks before each test
        axios.post.mockReset();

        // Clear localStorage at the start of each test
        localStorage.clear();
        
        // Set up a fresh DOM before each test
        document.body.innerHTML = `
        <!-- Registration form -->
        <h1>Register User</h1>
        <form id="register-form">
            <label for="register-username">Username:</label><br>
            <input type="text" name="username" id="register-username" required><br><br>

            <label for="register-password">Password:</label><br>
            <input type="password" name="password" id="register-password" required><br><br>

            <button type="submit" id="register-button">Register</button>
        </form>


        <!-- Login Form -->
        <h1>Login</h1>
        <form id="login-form">
            <label for="login-username">Username:</label><br>
            <input type="text" name="username" id="login-username" required><br><br>

            <label for="login-password">Password:</label><br>
            <input type="password" name="password" id="login-password" required><br><br>

            <button type="submit" id="login-button">Login</button>
        </form>

        <!-- Protected Content -->
        <div id="protected-content">
            <h2>Protected Data</h2>
            <button id="fetch-protected">Fetch Protected Data</button>
            <pre id="protected-data"></pre>
        </div>

        <!-- Logout Button -->
        <button id="logout-button">Logout</button>
        `;

            // Attach event listeners
            document.getElementById('register-form').addEventListener('submit', handleRegistration);
            document.getElementById('login-form').addEventListener('submit', handleLogin);
            document.getElementById('fetch-protected').addEventListener('click', accessProtected);
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Login functionality', () => {
        it('should authenticate a user with valid credentials', async () => {
            // Mock successful login response
            axios.post.mockResolvedValue({
                status: 200,
                data: { token: 'test-jwt-token' }
            });

            // Simulate user input and form submission
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');

            fireEvent.change(usernameInput, { target: { value: 'flarbene' } });
            fireEvent.change(passwordInput, { target: { value: 'Flarbene123!' } });
            fireEvent.submit(document.getElementById('login-form'));    

            // Wait for promises to resolve
            await Promise.resolve(process.nextTick);     
        
            expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/login',
                { username: 'flarbene', password: 'Flarbene123!' },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
        
            expect(localStorage.getItem('token')).toBe('test-jwt-token');
        });

        it('should handle login failure', async () => {
            // Mock failed login response
            axios.post.mockRejectedValue({ status: 401 });

            // Simulate user input and form submission
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');

            fireEvent.change(usernameInput, { target: { value: 'fakeuser' } });
            fireEvent.change(passwordInput, { target: { value: 'invalidpassword!' } });
            fireEvent.submit(document.getElementById('login-form'));

            // Wait for promises to resolve
            await Promise.resolve(process.nextTick);

            expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/login', 
                { username: 'fakeuser', password: 'invalidpassword!' },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            expect(localStorage.getItem('token')).toBeNull();
        });
    });
});