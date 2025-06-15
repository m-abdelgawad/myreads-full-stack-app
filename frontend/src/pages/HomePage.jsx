import ShelfSection from "../components/homepage/ShelfSection.jsx";
import React, {useEffect, useState} from "react";
import { api } from "../utils/api.js";

// define mock book data
function getBooksByShelf(allBooks, shelfName){
    return allBooks.filter(
        (book) => book.shelf === shelfName
    )
}

function HomePage() {
    // This component represents the home page of the application.

    useEffect(() => {
        document.title = "Home | MyReads";
    }, []);

    // 1) state for books, loading, and error
    const [books, setBooks] = useState([]) // Full list from API. intialized with empty array
    const [loading, setLoading] = useState(true) // Loading state to show a spinner or loading message
    const [error, setError] = useState(null) // Error state to handle any errors during data fetching

    // 2) Fetch books once when the component mounts
    useEffect(() => {

        async function fetchBooks() {

            setLoading(true); // Set loading to true before fetching data
            setError(null); // Reset error state

            try {

                console.log("Fetching user’s books…");

                // Get /books/
                const data = await api.get("/books");
                console.log("Fetched books:", data);

                setBooks(data); // Set the books state with the fetched data

            }  catch (err) {
                console.log("Error fetching books:", err);
                setError(err.message || "Failed to load books.");
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }

        }

        fetchBooks(); // Call the fetchBooks function to initiate data fetching

    }, []); // run only once (StrictMode will still call twice in dev)

    // We will update backend when the user changes a book's shelf
    // Once the backend is updated, we will update the local state to reflect the change
    async function handleShelfChange(bookId, newShelf) {
        try {
            await api.put(`/books/${bookId}`, { shelf: newShelf });
            // We have our API component to throw errors if the request fails.
            // So if the request is successful, we can assume the book was updated.

            // update local state to reflect the change
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === bookId ? { ...book, shelf: newShelf } : book
                )
            );
        } catch (err) {
            console.error("Error updating book shelf:", err);
            setError(err || "Failed to update book shelf.");
        }

        //
    }

    // 3) Handle loading and error states
    const shelves = {
        currentlyReading: getBooksByShelf(books, "currentlyReading"),
        wantToRead: getBooksByShelf(books, "wantToRead"),
        read: getBooksByShelf(books, "read")
    };

    console.log("Shelves data:", shelves);

    // 4) Render loading / error / content
    if (error) {
        return <div className="error">Error loading books: {error.message}</div>;
    }

    return (
        <div className="container">

            <ShelfSection title="Currently Reading" books={shelves.currentlyReading} onShelfChange={handleShelfChange}/>
            <ShelfSection title="Want To Read" books={shelves.wantToRead} onShelfChange={handleShelfChange}/>
            <ShelfSection title="Read" books={shelves.read} onShelfChange={handleShelfChange}/>

        </div>
    );
}

export default HomePage;