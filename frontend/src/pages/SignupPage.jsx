import React, {useEffect, useState} from 'react';
import { api } from '../utils/api.js'
import {useNavigate, Link} from "react-router-dom";

function SingupPage() {

    useEffect(() => {
        document.title = "Signup | MyReads";
    }, []);

    // 1) Form Field State

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 2) State variables for UI status

    // `loading`: Indicates whether a process (e.g., form submission) is in progress
    const [loading, setLoading] = useState(false);

    // `error`: Stores any error message related to the form submission
    const [error, setError] = useState(null);

    // `success`: Indicates whether the form submission was successful
    const [success, setSuccess] = useState(false);

    /**
     * A hook provided by `react-router-dom` to programmatically navigate between routes.
     *
     * @constant
     * @type {function}
     * @returns {function} A function that can be used to navigate to a different route.
     */
    const navigate = useNavigate();

    // 3) Handle form submission

    // Takes an event object `e` as an argument
    async function handleSubmit(e){

        // Prevents the default form submission behavior which would cause a page reload
        e.preventDefault()

        // Resets any previous error state
        setError(null)

        // Basic client-side validation
        if (password !== confirmPassword){
            setError("Passwords do not match");
            return;
        }

        if (!email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        // Sets loading state to true to indicate a process is ongoing
        setLoading(true);

        // Let's try to call the backend API to create a new user account
        try {
            const response = await api.post('/auth/signup', { email, password })
            console.log("Signup successful:", response);
            setSuccess(true); // Set success state to true
            // Optional: auto-redirect to login after a short delay
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            // If an error occurs, we log it to the console and error status code as well
            console.log("Signup failed:", err);
            console.log("Error status code:", err.status);
            setError(err.message);
        } finally {
            // Regardless of success or failure, we set loading to false; because the process is complete
            setLoading(false);
        }

    } // End of handleSubmit function

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>

                {/* Below is conditional rendering in react. If error exist, show the div*/}
                { error && <p className="auth-error">Error: {error}</p> }

                { success ? (
                    <div className="success-msg">
                      Account created! Redirecting to <Link to="/login">Login</Link>...
                    </div>
                ) : (

                    <form
                        className="auth-form"
                        role="form"
                        aria-label="Sign up form"
                        onSubmit={handleSubmit} // Attach the handleSubmit function to the form's onSubmit event
                    >

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                required aria-describedby="email-error"
                                value={ email }
                                onChange={ (e) => setEmail(e.target.value)}
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
                                value={ password }
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading} // Disable input while loading
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                className="form-input"
                                required
                                aria-describedby="confirm-password-error"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading} // Disable input while loading
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                    </form>

                )}
                <p className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    ); // End of return statement
} // End of SignupPage component

export default SingupPage;
