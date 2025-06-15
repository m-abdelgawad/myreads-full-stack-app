import BookCard from '../common/BookCard/BookCard.jsx';
import {Link} from "react-router-dom";


export default function ShelfSection({title, books, onShelfChange}) {

    // If the books array is undefined or empty, we can consider it as an empty shelf.
    const isEmpty = !books || books.length === 0;

    return (
        <section className="bookshelf-section" data-shelf={title}>
            <h2 className="shelf-title">{title}</h2>
            <div className="books-grid drop-zone">
                {/* If the shelf is empty, we can show a message or a link to add books */}
                {isEmpty ? (
                    <div className="empty-shelf">
                        <div className="empty-shelf-icon">📚</div>
                        <h3>Your reading list is empty</h3>
                        <p>Discover new books and add them to your want-to-read list</p>
                        <Link to="/search" className="empty-shelf-link">Search for Books</Link>
                    </div>
                ) : (
                    books.map(
                        (book) => (
                            // The key prop is used by React to identify which items have changed, are added, or are removed.
                            // It is a good practice to use a unique identifier for the key prop, such as an ID from the book object.
                            // In this case, we use book.id as the key.
                            <BookCard key={book.id} book={book} onShelfChange={onShelfChange}/>
                        )
                    )

                )}
            </div>
        </section>
    )
}