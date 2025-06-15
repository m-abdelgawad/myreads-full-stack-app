// src/context/BooksContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";        // <-- NEW
import { api } from "../utils/api.js";

const BooksContext = createContext();

export function BooksProvider({ children }) {
    const { isAuthenticated } = useAuth();            // <-- NEW
    const [books, setBooks]     = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBooks = useCallback(async () => {
        if (!isAuthenticated) {
            setBooks([]);          // clear old data when logged out
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await api.get("/books");
            setBooks(data);
        } catch (err) {
            console.error("Error fetching books:", err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // effect depends on auth status
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const updateBookShelf = async (bookId, newShelf) => {
        if (!isAuthenticated) return;
        await api.put(`/books/${bookId}`, { shelf: newShelf });   // backend now accepts null
        setBooks(prev =>
            prev.map(b => (b.id === bookId ? { ...b, shelf: newShelf } : b))
        );
    };

    return (
        <BooksContext.Provider value={{ books, loading, updateBookShelf }}>
            {children}
        </BooksContext.Provider>
    );
}

export const useBooks = () => useContext(BooksContext);
