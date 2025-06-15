const BASE_URL = import.meta.env.VITE_API_URL;
console.log(`API Base URL: ${BASE_URL}`);

function getToken() {
    return localStorage.getItem('access_token')
}

async function request(method, endpoint, body=null, customHeaders={}){

    const headers = {
        'content-type': 'application/json',
        ...customHeaders,
    };

    const token = getToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const apiURL = `${BASE_URL}${endpoint}`
    console.log(`Making ${method} request to: ${apiURL}`);

    // Ensure body is serializable before using JSON.stringify
    const processedBody = body ? sanitizeRequestBody(body) : null;

    const response = await fetch(apiURL, {
        method,
        headers,
        body: processedBody ? JSON.stringify(processedBody) : null,
    });

    const contentType = response.headers.get('content-type');

    const data = contentType && contentType.includes('application/json') ? await response.json() : await response.text();
    console.log(`Response from ${method} ${endpoint}:`, data);
    if (!response.ok) {
        const error = new Error(data.detail || data.message || 'An error occurred');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

// Helper function to sanitize request body and prevent circular references
function sanitizeRequestBody(body) {
    if (!body) return null;

    // Handle DOM elements or React components by creating a new plain object
    const sanitized = {};

    // Copy only plain properties
    Object.keys(body).forEach(key => {
        const value = body[key];
        // Include only primitive values (string, number, boolean) or arrays of primitives
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            (Array.isArray(value) && value.every(item =>
                typeof item === 'string' ||
                typeof item === 'number' ||
                typeof item === 'boolean'
            ))
        ) {
            sanitized[key] = value;
        }
    });

    return sanitized;
}

export const api = {
    get: (endpoint, customHeaders={}) => request('GET', endpoint, null, customHeaders),
    post: (endpoint, body, customHeaders={}) => request('POST', endpoint, body, customHeaders),
    put: (endpoint, body, customHeaders={}) => request('PUT', endpoint, body, customHeaders),
    delete: (endpoint, customHeaders={}) => request('DELETE', endpoint, null, customHeaders),
}