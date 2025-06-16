import { useEffect, useState } from "react";
import { useBooks } from "../context/BooksContext";
import { api } from "../utils/api";
import BookCard from "../components/common/BookCard/BookCard.jsx";

export default function SearchPage() {
  useEffect(() => { document.title = "Search | MyReads"; }, []);

  const { updateBookShelf } = useBooks();      // we still reuse the global updater
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ------- debounce search ------- */
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === "") {              // ✨ show nothing on first load / empty query
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const data = await api.post("/books/search", { query: trimmed, maxResults: 20 });
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300 ms

    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="container">
      <div className="search-section">

        <div className="search-input-container">
          <input
            className="search-input"
            placeholder="Search for books, authors, or ISBN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {query.trim() !== "" && (     /* render only after user types */
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
                    onShelfChange={updateBookShelf}
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
