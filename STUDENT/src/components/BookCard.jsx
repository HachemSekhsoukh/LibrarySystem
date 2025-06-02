// src/components/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Ensure we have a valid book object
  if (!book) {
    return null;
  }

  // Handle both resource and book property names
  const title = book.r_title || book.title || 'Untitled';
  const author = book.r_author || book.author || 'Unknown Author';
  const id = book.r_id || book.id;
  const cover = book.image_url || '/assets/books/blue_cpp.png';

  return (
    <Link to={`/book/${id}`} className="book-card-link">
      <div className="book-card">
        <div className="book-cover">
          <img 
            src={cover} 
            alt={title} 
            onError={(e) => {
              e.target.src = '/default-book-cover.jpg';
            }}
          />
        </div>
        <div className="book-info">
          <p className="author">{author}</p>
          <h3 className="title">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;