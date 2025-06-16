export default function ShelfSelector({ value, onChange, className = "" }) {
  // ▶ normalise: null / "" / undefined → "none"
  const current = value || "none";

  const handleChange = (e) => {
    const selected = e.target.value;

    if (selected === "none") {
      // Optional confirmation
      if (!window.confirm("Remove this book from your shelves?")) return;
      onChange(null);       // let parent convert null to "" / "null" for backend
    } else {
      onChange(selected);
    }
  };

  return (
    <div className={`shelf-selector ${className}`}>
      <select
        className="shelf-dropdown"
        value={current}
        onChange={handleChange}
      >
        <option value="none">None</option>
        <option value="currentlyReading">Currently Reading</option>
        <option value="wantToRead">Want to Read</option>
        <option value="read">Read</option>
      </select>
    </div>
  );
}