import {useEffect, useState} from "react";
import { useBooks } from "../context/BooksContext";
import BookCard from "../components/common/BookCard/BookCard.jsx";

function SearchPage() {

    useEffect(() => {
        document.title = "Search | MyReads";
    }, []);

    const { books, updateBookShelf } = useBooks();
    const [query, setQuery] = useState("");

    const filteredBooks = books.filter(book => {
        const lower = query.toLowerCase();
        return (
            book.title.toLowerCase().includes(lower) ||
            book.authors?.some(author => author.toLowerCase().includes(lower)) ||
            book.id.toLowerCase().includes(lower)
        );
    });

    return (
        <div className="container">
            <div className="search-section">
                <div className="search-input-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for books, authors, or ISBN..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="search-results">
                    <h2 className="search-results-title">Search Results</h2>
                    <div className="books-grid">
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map(book => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onShelfChange={updateBookShelf}
                                />
                            ))
                        ) : (
                            <p>No matching books found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;