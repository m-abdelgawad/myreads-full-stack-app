// src/pages/BookDetailsPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { api } from "../utils/api";
import ShelfSelector from "../components/common/BookCard/ShelfSelector.jsx";

export default function BookDetailsPage() {
    const { id } = useParams();            // 👉 book id from URL
    const { books, updateBookShelf } = useBooks();
    const [book, setBook]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // 1) Try to find book in already-fetched list
    useEffect(() => {
        const cachedBook = books.find(b => b.id === id);
        if (cachedBook) {
            setBook(cachedBook);
            setLoading(false);
        } else {
            // 2) Otherwise fetch from backend
            async function fetchBook() {
                try {
                    const data = await api.get(`/books/${id}`);
                    setBook(data);
                } catch (err) {
                    setError("Could not load book.");
                } finally {
                    setLoading(false);
                }
            }
            fetchBook();
        }
    }, [id, books]);

    // 3) Update title
    useEffect(() => {
        document.title = book ? `${book.title} | MyReads` : "Book Details | MyReads";
    }, [book]);

    // 4) Handle shelf change
    const handleShelfChange = (newShelf) => {
        updateBookShelf(book.id, newShelf);  // context updates global + backend
        setBook({ ...book, shelf: newShelf }); // local instantaneous update
    };

    // UI states
    if (loading) return <div className="container"><p>Loading…</p></div>;
    if (error  ) return <div className="container"><p className="error-msg">{error}</p></div>;
    if (!book  ) return null; // should not happen

    const thumbnail = book.imageLinks?.thumbnail || "https://oregonbravo.org/wp-content/uploads/2023/06/No-Image-Placeholder.svg_.png";

    return (
        <div className="container">
            <Link to="/" className="btn-link">← Back</Link>

            <div className="book-details-card">
                <div className="book-details-cover">
                    <img src={ thumbnail } alt={`${book.title} cover`} />
                </div>

                <div className="book-details-info">
                    <h1 className="book-details-title">{book.title}</h1>
                    <p className="book-details-authors">by {book.authors.join(", ")}</p>

                    <div className="book-details-shelf">
                        <label htmlFor="current-shelf">Current Shelf:&nbsp;</label>
                        <ShelfSelector
                            className="details-page"
                            value={book.shelf || ""}
                            onChange={handleShelfChange}
                        />
                    </div>

                    {book.description && (
                        <div className="book-details-description">
                            <h3>Description</h3>
                            <p>{book.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
