import ShelfSelector from "./ShelfSelector.jsx";
import { Link } from "react-router-dom";

export default function BookCard({ book, onShelfChange }) {

    const thumbnail = book.imageLinks?.thumbnail || "https://oregonbravo.org/wp-content/uploads/2023/06/No-Image-Placeholder.svg_.png";

    return (
        <div className="book-card draggable">
            <div className="book-cover">
                {/* Note how we must close the img tag with /, while the original file didn't have that */}
                <img src={ thumbnail } alt={ book.title } />
            </div>
            <div className="book-info">
                <h3 className="book-title">
                    <Link to={`/book/${book.id}`} className="book-link">
                        { book.title }
                    </Link>
                </h3>
                <p className="book-authors">{ book.authors.join(', ') }</p>
            </div>
            <ShelfSelector
                value={ book.shelf || '' }
                onChange= {
                    (newShelf) => {
                        console.log("Changing shelf to:", newShelf);
                        onShelfChange(book.id, newShelf)
                    }
                }
            />

        </div>
    )
}