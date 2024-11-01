// frontend/tests/app.test.js
import { fireEvent, getByLabelText } from '@testing-library/dom';

// Mock axios
jest.mock('axios', () => ({
    post: jest.fn()
}));

// import axios after mocking
import axios from 'axios';

import app from '../public/app.js';
const { handleLogin } = app;

describe('Login functionality', () => {
    beforeEach(() => {
        // Clear localStorage at the start of each test
        localStorage.clear();
        
        // Reset the mock before each test
        axios.post.mockReset();

        // Set up DOM elements
        document.body.innerHTML = `
            <!-- Login Form -->
            <h1>Login</h1>
            <form id="login-form">
                <label for="login-username">Username:</label><br>
                <input type="text" name="username" id="login-username" required><br><br>

                <label for="login-password">Password:</label><br>
                <input type="password" name="password" id="login-password" required><br><br>

                <button type="submit" id="login-button">Login</button>
            </form>
        `;
    
        // Attach event listeners
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should authenticate a user with valid credentials', async () => {
        // Mock successful login response
        axios.post.mockResolvedValue({
            status: 200,
            data: { token: 'test-jwt-token' }
        });

        // Simulate user input and form submission
        const usernameInput = getByLabelText(document.body, 'Username:');
        const passwordInput = getByLabelText(document.body, 'Password:');

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
        const usernameInput = getByLabelText(document.body, 'Username:');
        const passwordInput = getByLabelText(document.body, 'Password:');

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
