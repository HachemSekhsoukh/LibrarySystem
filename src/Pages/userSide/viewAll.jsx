import React, { useState } from "react";
import BookSection from "../../components/BookSection";
import "../../styles/LibraryHome.css";
import { FaSearch } from "react-icons/fa";
import bookData from "./LibraryHome";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaBookmark, FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import NavHeader from '../../components/NavHeader';

const ViewAll = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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
      <NavHeader />
      <div className = "page-content">
       <div className="back-button" onClick={() => navigate('/library')}>
                <FaArrowLeft /> Back to Library
              </div>
              
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
          title="All Books"
          books={bookData}
          showViewAll={false}
          number={15}
        />
      </main>
      </div>
    </div>
  );
};

export default ViewAll;