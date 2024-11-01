// frontend/tests/app.test.js
import { fireEvent } from '@testing-library/dom';

// Mock axios
jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn()
}));

// import axios after mocking
import axios from 'axios';

import app from './app.dummy.js';
const { handleLogin, handleRegistration, accessProtected } = app;

describe('Frontend Application Tests', () => {
    beforeEach(() => {
        // Reset mocks before each test
        axios.post.mockReset();
        axios.get.mockReset();

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

    describe('Registration functionality', () => {
        it('should register a user with valid credentials', async () => {
            // Mock successful registration response
            axios.post.mockResolvedValue({ status: 201, message: 'Created new user' });

            // Simulate user input and form submission
            const usernameInput = document.getElementById('register-username');
            const passwordInput = document.getElementById('register-password');

            // generate a random username
            const testUsername = `testuser${Math.floor(Math.random() * 100)}`;

            // Simulate user input and submit
            fireEvent.change(usernameInput, { target: { value: testUsername } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
            fireEvent.submit(document.getElementById('register-form'));

            // Wait for promises to resolve
            await Promise.resolve(process.nextTick);

            // Assertions
            expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/users',
                { username: testUsername, password: 'Password123!' },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
        });

        it('should fail to register a user with invalid credentials', async () => {
            // Mock failed registration response
            axios.post.mockRejectedValue({ status: 403 });

            // Simulate user input and submit
            const usernameInput = document.getElementById('register-username');
            const passwordInput = document.getElementById('register-password'); 

            fireEvent.change(usernameInput, { target: { value: '1invaliduser1_$' } });
            fireEvent.change(passwordInput, { target: { value: 'invalid' } });
            fireEvent.submit(document.getElementById('register-form'));

            // Wait for promises to resolve
            await Promise.resolve(process.nextTick);

            expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/users',
                { username: '1invaliduser1_$', password: 'invalid' },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
        });
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

    describe('Protected content functionality', () => {
        it('should access protected content after successful login', async () => {
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

            // Mock successful protected content response
            axios.get.mockResolvedValue({ status: 200, data: { data: 'This is protected data.' } });

            // Simulate click event
            const fetchProtectedButton = document.getElementById('fetch-protected');
            fireEvent.click(fetchProtectedButton);

            // Wait for promises to resolve
            await Promise.resolve(process.nextTick);
            await Promise.resolve(); // add extra tick to ensure DOM updates

            expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/protected', {
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true
            });

            console.log("axios.get.mock.calls: ", axios.get.mock.calls);

            console.log("Protected data:", document.getElementById('protected-data').innerHTML);
            
            // not working
            expect(document.getElementById('protected-data')).toHaveTextContent('This is protected data.');
        });
    });
});