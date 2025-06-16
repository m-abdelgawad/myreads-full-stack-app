import { useEffect, useState } from "react";
import { useBooks } from "../context/BooksContext";
import { api } from "../utils/api";
import BookCard from "../components/common/BookCard/BookCard.jsx";

export default function SearchPage() {
  /* ───────────────── document title ───────────────── */
  useEffect(() => {
    document.title = "Search | MyReads";
  }, []);

  /* ───────────────── context + state ───────────────── */
  const { updateBookShelf } = useBooks();   // global updater
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // for UI disable

  /* ───────────────── debounce search ───────────────── */
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.get(
          `/books/search?query=${encodeURIComponent(trimmed)}&maxResults=20`
        );
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  /* ───────────────── shelf change wrapper ───────────────── */
  const handleShelfChange = async (bookId, newShelf) => {
    try {
      setUpdatingId(bookId);
      await updateBookShelf(bookId, newShelf);           // backend + global
      // Patch local results so drop-down shows new value immediately
      setResults(prev =>
        prev.map(b => (b.id === bookId ? { ...b, shelf: newShelf } : b))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* ───────────────── render ───────────────── */
  return (
    <div className="container">
      <div className="search-section">
        {/* input */}
        <div className="search-input-container">
          <input
            className="search-input"
            placeholder="Search for books, authors, or ISBN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* results */}
        {query.trim() !== "" && (
          <div className="search-results">
            <h2 className="search-results-title">Search Results</h2>

            {loading ? (
              <p>Searching…</p>
            ) : results.length > 0 ? (
              <div className="books-grid">
                {results.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onShelfChange={handleShelfChange}
                    disabled={updatingId === book.id}   // optional prop to grey-out select
                  />
                ))}
              </div>
            ) : (
              <p>No matching books found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
