import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import BookCard from './BookCard';

const BookSection = ({ title, books, showViewAll = true, number = 5}) => {
  return (
    <div className="book-section">
      <div className="section-header">
        <h2>{title}</h2>
        {showViewAll && (
          <a href="#" className="view-all">
            view all <FaArrowRight />
          </a>
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