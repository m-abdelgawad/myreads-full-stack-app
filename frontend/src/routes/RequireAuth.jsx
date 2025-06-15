import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {

    const { isAuthenticated } = useAuth();
    const location = useLocation(); // Get the current location to redirect after login... nice, right?

    if (!isAuthenticated) {
        // If the user is not authenticated, redirect to the login page
        // and pass the current location so they can be redirected back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children; // If authenticated, render the child components
}
