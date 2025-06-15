import {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {api} from "../utils/api.js";

// 1) Create a context for authentication
const AuthContext = createContext();

// 2) Custom hook to ease the use of the AuthContext
export function useAuth() {
    return useContext(AuthContext);
}

// 3) Helper to parse JWT Payload
function parseJWT(token){
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

// AuthProvider component to provide authentication state and functions
export function AuthProvider({ children }) {

    // state to hold access token using lazy initialization
    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem('access_token')
    )

    // state to hold refresh token using lazy initialization
    const [refreshToken, setRefreshToken] = useState(
        () => localStorage.getItem('refresh_token')
    )

    // state to hold user authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem('access_token'))
    );

    // Optional: store user info if encoded in token
    const [user, setUser] = useState(
        () => {
            const token = localStorage.getItem('access_token');
            const payload = token ? parseJWT(token) : null;
            console.log("Parsed user from token:", payload);
            return payload ? { email: payload.sub, ...payload } : null;
        }
    );

    // 5) Function to refresh tokens
    const refreshTokens = useCallback(async () => {

        if (!refreshToken) {
            console.warn("No refresh token available, cannot refresh tokens.");
            return;
        }

        try {

            console.log("Refreshing tokens with refresh token:", refreshToken);
            const data = await api.post('/auth/refresh', { refresh_token: refreshToken });

            // update tokens
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            console.log("Tokens refreshed successfully:", data);

            // update user info if available
            const payload = parseJWT(data.access_token);
            if (payload) {
                setUser({ email: payload.sub, ...payload });
            }

            // Reshedule the next token refresh
            scheduleRefresh(data.access_token);
        } catch (err) {
            console.error("Token refresh failed:", err);
            logout(); // If refresh fails, log out the user
        }
    }, [refreshToken]); // end of refreshTokens

    // 6) Schedule automatic token refresh
    const scheduleRefresh = useCallback(
        (token) => {
            const payload = parseJWT(token);
            if (!payload || !payload.exp) return;

            const expiresAt = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const buffer = 30 * 1000; // 30 seconds buffer before expiration
            const delay = Math.max(expiresAt - now - buffer, 0); // Ensure non-negative delay

            // clear any existing timer
            if (AuthProvider._refreshTimeout) {
                clearTimeout(AuthProvider._refreshTimeout);
            }

            // Schedule a new timer to refresh the token
            AuthProvider._refreshTimeout = setTimeout(() => {
                refreshTokens();
            }, delay);
            console.log(`Token refresh scheduled in ${delay} ms`);
        }, [refreshTokens]
    ) // end of scheduleRefresh

    // 7) Function to log in the user
    const login = useCallback(async (email, password) => {

        const data = await api.post('/auth/login', { email, password });

        // save tokens to local storage
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setIsAuthenticated(true);

        // update user info if available
        const payload = parseJWT(data.access_token);
        if (payload) {
            setUser({ email: payload.sub, ...payload });
        }

        // Reschedule the next token refresh
        scheduleRefresh(data.access_token);
    }, [scheduleRefresh]); // end of login

    // 8) Function to log out the user
    const logout = useCallback(() => {
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Clear any existing refresh timeout
        if (AuthProvider._refreshTimeout) {
            clearTimeout(AuthProvider._refreshTimeout);
        }

    }, []) // end of logout

    // 9) Effect to handle initial token setup and refresh scheduling
    useEffect(() => {
        // If access token exists, set it and schedule refresh
        if (accessToken) {
            console.log("Access token found:", accessToken);
            scheduleRefresh(accessToken);
        } else {
            console.log("No access token found, user is not authenticated.");
        }

        // Cleanup function to clear the refresh timeout on unmount
        return () => {
            if (AuthProvider._refreshTimeout) {
                clearTimeout(AuthProvider._refreshTimeout);
            }
        };
    }, [accessToken, scheduleRefresh]); // end of useEffect

    // 10) Context value to be provided
    const value = {
        accessToken,
        refreshToken,
        isAuthenticated,
        user,
        login,
        logout,
        refreshTokens,
    };

    // 11) Return the AuthContext provider with the value
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )


} // end of AuthProvider