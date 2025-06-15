import ShelfSelector from "./ShelfSelector.jsx";
import { Link } from "react-router-dom";
import no_image_placeholder from "../../../assets/images/no_image_placeholder.png";

export default function BookCard({ book, onShelfChange }) {

    const thumbnail = book.imageLinks?.thumbnail || no_image_placeholder;

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
                <p className="book-authors">{ book.authors.join(', ') || "Author name isn't available"}</p>
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