import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaBookmark, FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import "../../styles/LibraryHome.css";
import '../../styles/BookDetail.css';
import { fetchResourceById, fetchPopularResources } from '../../utils/api';
import BookSection from '../../components/BookSection';
import popularBooks from './LibraryHome'

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  
  // Use useEffect to fetch the book data when the component mounts
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the book data from the API
        const bookData = await fetchResourceById(id);
        
        if (!bookData) {
          console.error(`No book found with ID ${id}`);
          setError('Book not found');
          setIsLoading(false);
          return;
        }
        
        setBook(bookData);
        console.log('Fetched book data:', bookData);
        
        // Fetch similar books (using popular books as a substitute for now)
        try {
          const similar = await fetchPopularResources(5);
          // Filter out the current book from similar books
          const filteredSimilar = similar.filter(b => 
            (b.id !== bookData.id) && (b.r_id !== bookData.id)
          );
          
          if (filteredSimilar && filteredSimilar.length > 0) {
            setSimilarBooks(filteredSimilar);
            console.log(`Fetched ${filteredSimilar.length} similar books from database`);
          } else {
            // Only fall back to mock data if no similar books are found
            console.warn('No similar books found in database, using fallback data');
            const mockSimilar = bookDetails[1].similarBooks.map(bookId => bookDetails[bookId]);
            setSimilarBooks(mockSimilar);
          }
        } catch (similarError) {
          console.error('Error fetching similar books:', similarError);
          const mockSimilar = bookDetails[1].similarBooks.map(bookId => bookDetails[bookId]);
          setSimilarBooks(mockSimilar);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);

  // Function to handle the booking process
  const handleConfirmBooking = () => {
    // Here you would typically handle the booking logic
    console.log('Book confirmed:', book.title);
    setShowPopup(false);
    // Add additional logic for book reservation here
  };
  
  if (isLoading) {
    return (
      <div className="book-detail-page">
        <header className="nav-header">
          <div className="logo">
            <img src="/imageslogo.png" alt="ENSIA Logo" />
          </div>
        </header>
        <div className="loading-container">
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="book-detail-container">
        <div className="back-button" onClick={() => navigate('/library')}>
          <FaArrowLeft /> Back to Library
        </div>
        <div className="book-not-found">
          <h2>Book Not Found</h2>
          <p>The book you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  // Extract data with fallbacks
  const title = book.title || 'Unknown Title';
  const author = book.author || 'Unknown Author';
  const editor = book.editor || 'Unknown Editor';
  const observation = book.observation || 'No description available.';
  const cote = book.cote || 'N/A';
  
  // Always use static cover image based on book ID
  const getStaticCoverImage = () => {
    const id = book.id || 1;
    const coverImages = [
      '/assets/books/blue_cpp.png',
      '/assets/books/yellow_cpp.png',
      '/assets/books/cpp_stevens.jpg'
    ];
    return coverImages[id % coverImages.length];
  };
  
  return (
    <div className="book-detail-page">
      <header className="nav-header">
        <div className="logo">
          <img src="/imageslogo.png" alt="ENSIA Logo" />
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#">News</a></li>
            <li><a href="#">The School</a></li>
            <li><a href="#">Study</a></li>
            <li><a href="#">Research</a></li>
            <li><a href="#">Cooperation</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Connect</a></li>
          </ul>
        </nav>
      </header>

      <div className="page-content">
        <div className="back-button" onClick={() => navigate('/library')}>
          <FaArrowLeft /> Back to Library
        </div>

        <div className="page-title-container">
          <h1 className="page-title">{author} - {title}</h1>
        </div>

        <div className="book-detail-container">
          <div className="book-detail-content">
            <div className="book-detail-left">
              <img 
                src={getStaticCoverImage()} 
                alt={title} 
                className="book-cover-large" 
              />
            </div>
            
            <div className="book-detail-right">
              <div className="book-breadcrumb">
                Editor: {editor} / Cote: {cote}
              </div>
              
              <h1 className="book-title">{title}</h1>
              <h3 className="book-author">{author}</h3>
            </div>
          </div>
        </div>
        
        <div className="book-description-container">
          <p className="book-description">{observation}</p>
          <button className="book-now-button" onClick={() => setShowPopup(true)}>Book Now</button>
        </div>
        
        {/* Booking Confirmation Popup */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="booking-popup">
              <h2>Confirm Booking</h2>
              <div className="booking-details">
                <p><strong>Email:</strong> student@ensia.edu</p>
                <p><strong>Book Title:</strong> {title}</p>
                <p><strong>Book Code:</strong> {cote}</p>
              </div>
              <div className="popup-actions">
                <button 
                  className="popup-button confirm-button" 
                  onClick={handleConfirmBooking}
                >
                  Confirm
                </button>
                <button 
                  className="popup-button cancel-button" 
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="similar-books-section">
          <div className="similar-books-grid">
            <BookSection title="Similar Books" books={popularBooks} showViewAll={false}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail; 