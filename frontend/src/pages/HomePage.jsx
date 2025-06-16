import React, { useEffect, useState } from "react";
import ShelfSection from "../components/homepage/ShelfSection.jsx";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext";

function getBooksByShelf(all, shelf) {
  return all.filter(b => b.shelf === shelf);
}

export default function HomePage() {
  /* -------------- document title -------------- */
  useEffect(() => { document.title = "Home | MyReads"; }, []);

  /* -------------- auth + state -------------- */
  const { isAuthenticated } = useAuth();      // 🔑 new
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  /* -------------- fetch only when logged-in -------------- */
  useEffect(() => {
    if (!isAuthenticated) {                   // skip when not logged in
      setBooks([]);
      setLoading(false);
      return;
    }

    async function fetchBooks() {
      try {
        setLoading(true);
        const data = await api.get("/books/shelved");
        setBooks(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load books.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [isAuthenticated]);

  /* -------------- shelf change handler -------------- */
  async function handleShelfChange(id, newShelf) {
    try {
      await api.put(`/books/${id}`, { shelf: newShelf });
      setBooks(prev =>
        prev.map(b => (b.id === id ? { ...b, shelf: newShelf } : b))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update shelf.");
    }
  }

  /* -------------- derived shelves -------------- */
  const shelves = {
    currentlyReading: getBooksByShelf(books, "currentlyReading"),
    wantToRead:       getBooksByShelf(books, "wantToRead"),
    read:             getBooksByShelf(books, "read"),
  };

  /* -------------- render states -------------- */
  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error)   return <div className="container"><p className="error-msg">{error}</p></div>;

  return (
    <div className="container">
      <ShelfSection title="Currently Reading" books={shelves.currentlyReading} onShelfChange={handleShelfChange}/>
      <ShelfSection title="Want To Read"       books={shelves.wantToRead}       onShelfChange={handleShelfChange}/>
      <ShelfSection title="Read"               books={shelves.read}             onShelfChange={handleShelfChange}/>
    </div>
  );
}
