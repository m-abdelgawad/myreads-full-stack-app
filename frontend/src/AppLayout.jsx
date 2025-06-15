// Shared layout: Navbar, Footer, Floating plus icon
/**
 * Imports the `Outlet` component from `react-router-dom`.
 *
 * The `Outlet` component is used as a placeholder for rendering child routes
 * defined in the routing configuration. It allows nested routes to be displayed
 * within the parent component.
 */
import { Outlet } from "react-router-dom";
import ScrollToTop from './components/common/ScrollToTop.jsx';
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from "./context/AuthContext.jsx";

/**
 * Defines the shared layout for the application, including the Navbar, Footer,
 * and a floating button for adding books. It also uses the `Outlet` component
 * to render child routes dynamically.
 */
function AppLayout() {

    // Access the authentication context to check if user is already authenticated
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate(); // Hook to programmatically navigate between routes

    function handleLogout() {
        logout(); // Call the logout function from AuthContext
        navigate('/login'); // Redirect to the login page after logout
    }

    return (
        // That’s called a fragment. It’s a special shorthand in React that means:
        // “Return multiple elements without wrapping them in an extra <div>.”
        // It’s often used in layouts like AppLayout to avoid unnecessary HTML nesting.
        <>
            {/* Scroll to top on route change */}
            <ScrollToTop />

            <nav className="navbar">
                <div className="nav-content">
                    <a className="nav-title" href="/">
                        <span className="logo-text">BookShelf</span>
                    </a> {/* Link to the homepage */}

                    <div className="nav-links">
                        {isAuthenticated ? (
                            <>
                                <a className="nav-home-btn" href="/">Home</a>
                                <a
                                    className="nav-auth-btn"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLogout();
                                    }}
                                >
                                    Logout
                                </a>
                            </>
                        ) : (
                            <a className="nav-auth-btn" href="/login">Login</a>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <Outlet/> {/* Placeholder for nested routes */}
            </main>

            { isAuthenticated && (
                <button className="floating-add-btn" title="Add Book" onClick={() => window.location.href = '/search'}>
                    +
                </button>
            )}


            <footer className="footer">
                <div className="footer-content">
                    <p>Developed by <a className="footer-link" target="_blank" href="https://www.linkedin.com/in/m-abdelgawad/">Mohamed AbdelGawad</a> </p>
                </div>
            </footer>
        </>
    );
}

export default AppLayout;