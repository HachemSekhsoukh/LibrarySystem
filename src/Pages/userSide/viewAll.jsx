import React, { useState } from "react";
import BookSection from "../../components/BookSection";
import "../../styles/LibraryHome.css";
import { FaSearch } from "react-icons/fa";
import bookData from "./LibraryHome";

const ViewAll = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="library-home">
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <div className="search-input">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Title, Author or ISBN ..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </form>

      <main className="main-content">
        <BookSection
          title="Latest Books"
          books={bookData}
          showViewAll={false}
          number={15}
        />
      </main>
    </div>
  );
};

export default ViewAll;