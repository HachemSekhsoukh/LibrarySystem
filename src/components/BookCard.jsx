// src/components/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Ensure we have a valid book object
  if (!book) {
    return null;
  }

  return (
    <Link to={`/book/${book.r_id}`} className="book-card-link">
      <div className="book-card">
        <div className="book-cover">
          <img 
            src={'public/assets/books/blue_cpp.png'} 
            alt={book.r_title || 'Book cover'} 
            onError={(e) => {
              e.target.src = '/default-book-cover.jpg';
            }}
          />
        </div>
        <div className="book-info">
        <p className="author">{book.r_author || 'Unknown Author'}</p>
          <h3 className="title">{book.r_title || 'Untitled'}</h3>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;