/**
 * App routes setup using react-router-dom.
 * The root path `/` renders the AppLayout component.
 * Nested routes (children) are rendered inside AppLayout.
 */
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../AppLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import BookDetailsPage from "../pages/BookDetailsPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import RequireAuth from "./RequireAuth.jsx"; // Importing the RequireAuth component for protected routes

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />, // AppLayout always appears at `/` and all its children
        children: [

            {
                index: true, // This child matches the exact `/` path
                element:
                    <RequireAuth>
                        {/* RequireAuth wraps the page to protect it */}
                        <HomePage />
                    </RequireAuth>
            },

            {
                path: "search",
                element:
                    <RequireAuth>
                        {/* RequireAuth wraps the page to protect it */}
                        <SearchPage />
                    </RequireAuth>
            },

            {
                path: "book/:id",
                element:
                    <RequireAuth>
                        {/* RequireAuth wraps the page to protect it */}
                        <BookDetailsPage />
                    </RequireAuth>
            },

            {
                path: "login",
                element:
                    <LoginPage />
            },

            {
                path: "signup",
                element:
                    <SignupPage />
            },

        ]
    },
]);

export default router;