import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import BookCard from './BookCard';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAllResources } from '../utils/api';

const BookSection = ({ title, showViewAll = true, number = 5 }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const resources = await fetchAllResources();
                // Limit the number of books displayed
                setBooks(resources.slice(0, number));
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchBooks();
    }, [number]);

    if (loading) {
        return <div className="book-section">Loading books...</div>;
    }

    if (error) {
        return <div className="book-section">Error: {error}</div>;
    }

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
                {books.map((book) => (
                    <BookCard key={book.r_id} book={book} />
                ))}
            </div>
        </div>
    );
};

export default BookSection;