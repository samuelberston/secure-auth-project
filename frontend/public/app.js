// handle registration
async function handleRegistration(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    console.log('POST /users');

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

        if (response.status === 201) {                                  // Registered user
            console.log(`200 - Registered user with username ${username}.`);
            alert(`Registered user with username ${username}.`);
        } else if (response.status === 403) {                           // Invalid credentials
            console.log('403 - Credentials do not meet requirements.');
            alert('Credentials do not meet requirements. [Include requirements]')
        } else if (response === 409) {                                  // User already exists
            console.log('409 - Attempt to register duplicate user');
            alert('Please choose a different username.');
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

        if (response.status === 200) {                      // Successful login
            // retrieve JWT from HTTP response 
            const token = response.data.token;

            // Store token in localStorage
            localStorage.setItem('token', token);

            // Update UI
            document.getElementById('login-form').style.display = 'none';
            // document.getElementById('protected-section').style.display = 'block';
            // document.getElementById('logout-button').style.display = 'block';
            alert('Login successful!');
        } else if (response.status === 401) {
            console.warn('UNAUTHORIZED LOGIN ATTEMPT!');   // Unauthorized login attempt
            alert('Login failed. Please check your credentials.');
        } else if (response.status === 500) {              // Server-side error during login
            console.error('Login failed with 500.');
            alert('Login failed due to a server-side error.');
        }
    } catch (err) {
        console.error(err);
        alert('Login failed.');
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

            // sanitize the data before insertin into DOM
            const sanitizedData = DOMPurify.sanitize(JSON.stringify(data, null, 2))
            document.getElementById('protected-data').innerHTML = sanitizedData;
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
