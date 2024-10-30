// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// handle registration
async function handleRegistration(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    console.log('POST /api/users');

    try {
        const response = await axios.post('http://localhost:3000/users',
            { username, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );

        if (response.status === 201) {
            console.log("Registration successful");
        } else {
            throw new Error("Failed to register user");
        }
    } catch (err) {
        console.error(err);
    }
}

// handle login
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await axios.post('http://localhost:3000/login', 
            { username, password }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );

        if (response.status === 200) { 
            const token = response.data.token;

            // Store token in localStorage
            localStorage.setItem('token', token);

            // Update UI
            // document.getElementById('login-form').style.display = 'none';
            // document.getElementById('protected-section').style.display = 'block';
            // document.getElementById('logout-button').style.display = 'block';
            alert('Login successful!');
        } else {
            console.log('Login failed');
            alert('Login failed. Please check your credentials.');
        }
    } catch (err) {
        console.error(err);
        alert('Login failed. Please check your credentials.');
    }
}

// handle logout
function handleLogout() {
    localStorage.removeItem('token');
    // Update UI accordingly
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('protected-section').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('protected-data').textContent = '';
    alert('Logged out successfully.');
}

// access protected
async function accessProtected() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('No token found. Please log in.');
        return;
    }

    try {
        const response = await axios.get('http://localhost:3000/protected', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.status === 200) {
            const { data } = response.data;
            document.getElementById('protected-data').textContent = JSON.stringify(data, null, 2);
        } else {
            throw new Error(response);
        }
    } catch (err) {
        console.error(err);
    }
}

// init function
async function init() {
    // initialize session and get CSRF token
    try {
        const response = await axios.get('/api/init-session', { withCredentials: true });
    } catch (err) {
        console.error(err);
    }

    // Event listeners
    document.getElementById('register-form').addEventListener('submit', handleRegistration);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('fetch-protected').addEventListener('click', accessProtected);

    // Check if token exists on page load
    const token = localStorage.getItem('token');
    if (token) {
        // document.getElementById('login-form').style.display = 'none';
        // document.getElementById('protected-content').style.display = 'block';
        // document.getElementById('logout-button').style.display = 'block';
    }
}

// Run initialization on DOMContentLoaded
window.addEventListener('DOMContentLoaded', init);
