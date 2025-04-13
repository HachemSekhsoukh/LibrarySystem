import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import BookCard from './BookCard';
import { useParams, useNavigate, Link } from 'react-router-dom';

const BookSection = ({ title, showViewAll = true, number = 5 }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/resources');
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data = await response.json();
                // Map the API response fields to the expected format
                const mappedBooks = data.map(book => ({
                    r_id: book.id,
                    r_title: book.title,
                    r_author: book.author,
                    r_editor: book.editor,
                    r_ISBN: book.isbn,
                    r_price: book.price,
                    r_cote: book.cote,
                    r_receivingDate: book.receivingDate,
                    r_status: book.status,
                    r_observation: book.observation,
                    r_type: book.type,
                    r_description: book.description
                }));
                // Limit the number of books displayed
                setBooks(mappedBooks.slice(0, number));
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