// src/components/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  return (
    <Link to={`/book/${book.id}`} className="book-card-link">
      <div className="book-card">
        <div className="book-cover">
          <img src={book.coverImage} alt={book.title} />
        </div>
        <div className="book-info">
          <p className="author">Mohammed HAZI</p>
          <p className="category">
            <span>Aalyse Numérique 1</span>
            Easy to study Mathematical problems
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;