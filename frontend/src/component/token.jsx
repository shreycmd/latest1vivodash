const fetchWithAuth = async (url, options = {}) => {
    // Retrieve the JWT token from localStorage
    const token = localStorage.getItem('token');

    // If there's no token, redirect to login and stop the request
    if (!token) {
        window.location.href = '/';
        return; // Prevents further execution
    }

    // Set up the headers, including the Authorization token
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    // Make the request with the headers
    const response = await fetch(url, { ...options, headers });

    // Check for HTTP errors
    if (!response.ok) {
        if (response.status === 401) {
            // If unauthorized (token expired or invalid), redirect to login
            localStorage.removeItem('token'); // Optional: clear invalid token
            window.location.href = '/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Return the response object or parsed JSON as needed
    return response;
};

export default fetchWithAuth;