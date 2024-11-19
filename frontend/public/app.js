// get advice of the day
async function getAdviceOfTheDay() {
    // Check cache first
    try {
        const cachedAdvice = localStorage.getItem('advice');
        if (cachedAdvice) {
            // Check expired
            const { advice, timestamp } = JSON.parse(cachedAdvice);
            const now = new Date();
            const cacheDate = new Date(timestamp);
            if (now.toDateString() === cacheDate.toDateString()) {
                document.getElementById('advice-data').textContent = advice;
                return;
            }
        }
    } catch (err) {
        // Handle corrupted cache data
        console.warn('Cache data is corrupted. Clearing advice cache.');
        localStorage.removeItem('advice');
    }

    // If no cache or cache expired, fetch new advice
    document.getElementById('advice-loading').style.display = 'block';
    document.getElementById('advice-data').textContent = '';

    try {
        const response = await axios.get(`/api/advice`);
        const { advice } = response.data;

        // Cache advice
        const timestamp = new Date().getTime();
        localStorage.setItem(
            'advice', 
            JSON.stringify({ advice, timestamp })
        );

        // update DOM
        document.getElementById('advice-data').textContent = advice;
    } catch (err) {
        if (err.response ) { 
            switch (err.response.status) {
                case 404:
                    document.getElementById('advice-data').textContent = 'No advice found for today.';
                    break;
                default:
                    document.getElementById('advice-data').textContent = 'Failed to load advice. Please try again later.';
            }
        } else {
            document.getElementById('advice-data').textContent = 'Network error. Please check your connection.';
        }
        console.error('Error fetching advice:', err);
    } finally {
        // Always hide loading indicator
        document.getElementById('advice-loading').style.display = 'none';
    }
}

// handle registration

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

function validatePassword(password) {
  return passwordRegex.test(password);
}

async function handleRegistration(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    if (!validatePassword(password)) {
        alert('Password does not meet the requirements.');
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        return;
    }

    console.log('POST /users');

    try {
        const response = await axios.post(`/backend/users`,
            { username, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );

        if (response.status === 201) {                                  // Registered user
            // reset input fields
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-response').textContent = JSON.stringify(response.data.message, null, 2);
            
            console.log(`200 - Registered user with username ${username}.`);
            alert(`Registered user with username ${username}.`);
        } 
    } catch (err) {
        if (err.response) {
            console.log('err.response: ', err.response);
            switch (err.response.status) {
                case 400:
                    console.error(err);
                    document.getElementById('register-username').value = '';
                    document.getElementById('register-password').value = '';  
                    document.getElementById('register-response').textContent = JSON.stringify(err.response.data.message, null, 2);
        
                    console.log('400 - Credentials do not meet requirements.');
                    alert('Credentials do not meet requirements. [Include requirements]')
                    break;
                case 409:
                    console.error(err);
                    document.getElementById('register-username').value = '';
                    document.getElementById('register-password').value = '';  
                    document.getElementById('register-response').textContent = JSON.stringify(err.response.data.message, null, 2);
                    console.log('409 - Attempt to register duplicate user');
                    alert('Please choose a different username.');
                    break;
                default:
                    console.error(err);
                    alert('Registration failed. Please check your credentials.');
                }
        } else {
            console.error(err);
            alert('Registration failed. Please check your credentials.');
        }
    }
}

// handle login
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await axios.post(`/backend/login`, 
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

            // reset input fields
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';

            // Update UI elements visibility
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('protected-content').style.display = 'block';
            document.getElementById('fetch-protected').style.display = 'block';
            document.getElementById('logout-button').style.display = 'block';

            alert('Login successful!');
        } 
    } catch (err) {
        if (err.response) {
            switch (err.response.status) {
                case 401:
                    console.warn('UNAUTHORIZED LOGIN ATTEMPT!');   // Unauthorized login attempt
                    // reset input fields
                    document.getElementById('login-username').value = '';
                    document.getElementById('login-password').value = '';
                    alert('Login failed. Please check your credentials.');
                    break;
                case 500:
                    console.error('Login failed with 500.');
                    // reset input fields
                    document.getElementById('login-username').value = '';
                    document.getElementById('login-password').value = '';
                    alert('Login failed due to a server-side error.');
                    break;
                default:
                    console.error(err);
                    alert('Login failed.');
            }
        } else {
            console.error(err);
            alert('Login failed.');
        }
    }
}

// handle logout
function handleLogout() {
    localStorage.removeItem('token'); // NOT WORKING!
    // Update UI accordingly
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('protected-content').style.display = 'none';
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
        const response = await axios.get(`api/protected`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.status === 200) {
            console.log('200 - Received protected data from server.');
            const { data } = response.data;

            // Sanitize data before inserting into DOM to prevent XSS.
            const sanitizedData = DOMPurify.sanitize(JSON.stringify(data, null, 2))
            document.getElementById('fetch-protected').style.display = 'none';
            document.getElementById('protected-data').innerHTML = sanitizedData;
        } else if (response.status === 401) { 
            console.warn('401 - Unauthorized attempt to view protected data.');
            alert('You must login to access protected data.');
        } else if (response.status === 403) {
            console.warn('403 - Attempt to access protected data with expired token.');
            alert('Token invalid/expired. Please logout and login again.');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to retrieve protected data');
    }
}

// init function
async function init() {
    
    // initialize session
    try {
        const response = await axios.get('/api/init-session', { withCredentials: true });
        console.log('Initialized session with id: ', response);
    } catch (err) {
        console.error(err);
        alert('Please reload page: Unable to initialize session.');
    }

    // get advice of the day
    await getAdviceOfTheDay();
    
    // Event listeners
    document.getElementById('register-form').addEventListener('submit', handleRegistration);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('fetch-protected').addEventListener('click', accessProtected);
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Check if token exists on page load
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
        document.getElementById('logout-button').style.display = 'block';
    }
}

// Run initialization on DOMContentLoaded
window.addEventListener('DOMContentLoaded', init);
