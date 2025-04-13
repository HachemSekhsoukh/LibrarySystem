import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import BookCard from './BookCard';
import { useParams, useNavigate, Link } from 'react-router-dom';

const BookSection = ({ title, books, showViewAll = true, number = 5}) => {
    const { id } = useParams();
    const navigate = useNavigate();
  return (
    <div className="book-section">
      
      <div className="section-header">
      <h2>{title}</h2>
      {showViewAll && (
        <button
          onClick={() => navigate('/view-all')}
          className="view-all"
          type="button"
        >
          view all <FaArrowRight />
        </button>
      )}
    </div>
      <div className="books-grid">
      {Array(number).fill().map((_, i) => (
          <BookCard key={i} book={{
            id: i + 1,
            coverImage: '/assets/books/blue_cpp.png'
          }} />
        ))}
      </div>
    </div>
  );
};

export default BookSection;