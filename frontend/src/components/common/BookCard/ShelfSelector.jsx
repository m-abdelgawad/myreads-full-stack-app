export default function ShelfSelector({ value, onChange, className = '' }) {
    const handleChange = (event) => {
        const newShelf = event.target.value;

        // Optional: Confirm with user before removing
        if (newShelf === "") {
            if (!window.confirm("Remove this book from your shelf?")) return;
            onChange(null);  // or '' depending on your backend
        } else {
            onChange(newShelf);
        }
    };

    return (
        <div className={`shelf-selector ${className}`}>
            {/* Original template didn't have a default value as well and used selected on the option*/}
            {/* However, React controls the form element by passing the selected value through the value prop */}
            {/* VIP:  React expects the value on the <select> to exactly match the value on an <option> */}
            {/* so the value passed from database should be exactly the value string in the options */}
            <select className="shelf-dropdown" value={value} onChange={handleChange}>
                <option value="">Add to shelf...</option>
                <option value="currentlyReading">Currently Reading</option>
                <option value="wantToRead">Want to Read</option>
                <option value="read">Read</option>
            </select>
        </div>
    )
}