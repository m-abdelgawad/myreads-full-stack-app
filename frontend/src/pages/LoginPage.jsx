import React, {useState, useEffect} from "react";
import { api } from '../utils/api.js'
import {useNavigate, Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

function LoginPage(){

    useEffect(() => {
        document.title = "Login | MyReads";
    }, []);

    // 1) Form Field State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 2) State variables for UI status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate(); // Hook to programmatically navigate between routes

    // Access the authentication context to check if user is already authenticated
    const { login, isAuthenticated } = useAuth();

    // Use useEffect to handle the redirect for already authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            console.log("User is already authenticated, redirecting to home page...");
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // 3) Handle form submission
    async function handleSubmit(event) {

        // Prevents the default form submission behavior which would cause a page reload
        event.preventDefault();

        // Reset any previous error state
        setError(null);

        // Basic client-side validation
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        // Set loading state to true to indicate a process is ongoing
        setLoading(true);

        // Attempt to call the backend API to log in the user
        try {
            await login(email, password);
            setSuccess(true);

            // Redirect to the home page after successful login after a short delay
            setTimeout(() => {
                navigate('/'); // Redirect to home page
            }, 1000); // 1 second delay
        } catch (error) {
            console.error("Login error:", error);
            console.error("Error details:", error.data || error.message);
            console.error("Error status:", error.status);
            setError(error.message || "An error occurred during login");
        } finally {
            // Reset loading state after the request is complete
            setLoading(false);
        }
    } // end of handleSubmit

    // If the user is authenticated, return a loading message instead of null
    // to prevent empty screen while redirecting
    if (isAuthenticated) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <p className="auth-success">Already logged in. Redirecting to homepage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Login to BookShelf</h2>

                {error && <p className="auth-error">Error: {error}</p>}

                { success ? (
                    <p className="auth-success">Login successful! Redirecting...</p>
                ) : (
                    <form
                        className="auth-form"
                        role="form"
                        aria-label="Login form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                required
                                aria-describedby="email-error"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading} // Disable input while loading
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                required
                                aria-describedby="password-error"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading} // Disable input while loading
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                    </form>
                )}

                <p className="auth-link">
                    Don't have an account? <Link to="/signup">Sign Up Here</Link>
                </p>

            </div>
        </div>
    )
}

export default LoginPage;