import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaBookmark, FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import '../../CSS/BookDetail.css';
import { fetchResourceById, fetchPopularResources } from '../../utils/api';
import BookSection from '../../components/BookSection';
import popularBooks from './LibraryHome'

// Mock data - in a real app, this would come from an API
const bookDetails = {
  1: {
    id: 1,
    title: 'Whispers of the Forgotten',
    author: 'Hazi Mouhammed',
    edition: 'Fourth Edition',
    coverImage: '/assets/books/cpp_stevens.jpg',
    category: 'Mathematics',
    subcategory: 'Analysis',
    publisher: 'Addison-Wesley Professional',
    publishedDate: 'May 9, 2013',
    isbn: '978-0321563842',
    pages: 1368,
    language: 'English',
    description: 'In a small coastal town shrouded in mist, journalist Emily Carter stumbles upon a decades-old secret buried beneath the ruins of an abandoned lighthouse. As she pieces together cryptic letters and forgotten diaries, she discovers a chilling connection to a string of unsolved disappearances. But the closer she gets to the truth, the more dangerous her journey becomes. Someone is watching—someone who will do anything to keep the past buried.',
    availability: 'Available',
    location: 'Section A, Shelf 3',
    similarBooks: [1, 1, 1, 1, 1] // Using the same book 5 times for the example
  },
  2: {
    id: 2,
    title: 'Whispers of the Forgotten',
    author: 'Hazi Mouhammed',
    edition: 'Second Edition',
    coverImage: '/assets/books/yellow_cpp.png',
    category: 'Mathematics',
    subcategory: 'Analysis',
    description: 'In a small coastal town shrouded in mist, journalist Emily Carter stumbles upon a decades-old secret buried beneath the ruins of an abandoned lighthouse. As she pieces together cryptic letters and forgotten diaries, she discovers a chilling connection to a string of unsolved disappearances. But the closer she gets to the truth, the more dangerous her journey becomes. Someone is watching—someone who will do anything to keep the past buried.',
    similarBooks: [1, 1, 1, 1, 1]
  },
  3: {
    id: 3,
    title: 'Whispers of the Forgotten',
    author: 'Hazi Mouhammed',
    edition: '7th Edition',
    coverImage: '/assets/books/cpp_stevens.jpg',
    category: 'Mathematics',
    subcategory: 'Analysis',
    description: 'In a small coastal town shrouded in mist, journalist Emily Carter stumbles upon a decades-old secret buried beneath the ruins of an abandoned lighthouse. As she pieces together cryptic letters and forgotten diaries, she discovers a chilling connection to a string of unsolved disappearances. But the closer she gets to the truth, the more dangerous her journey becomes. Someone is watching—someone who will do anything to keep the past buried.',
    similarBooks: [1, 1, 1, 1, 1]
  },
  4: {
    id: 4,
    title: 'C++ A Beginner\'s Guide',
    author: 'Herbert Schildt',
    edition: 'Second Edition',
    coverImage: '/assets/books/yellow_cpp.png',
    category: 'Programming',
    subcategory: 'Mathematics',
    publisher: 'McGraw-Hill Education',
    publishedDate: 'November 25, 2003',
    isbn: '978-0072232158',
    pages: 600,
    language: 'English',
    description: 'Essential Skills--Made Easy! Learn the fundamentals of C++ programming with this beginner\'s guide, written by best-selling programming author Herb Schildt. Beginning with basic concepts, this step-by-step guide covers the fundamentals of C++, including detailed explanations of object-oriented programming, templates, and key C++ libraries.',
    availability: 'Checked Out',
    location: 'Section B, Shelf 1',
    reviews: [
      { user: 'Robert Johnson', rating: 4, comment: 'Great for beginners like me.' },
      { user: 'Mary Williams', rating: 5, comment: 'Clear explanations with good examples.' }
    ]
  },
  5: {
    id: 5,
    title: 'C++ Programming',
    author: 'Al Stevens',
    edition: '7th Edition',
    coverImage: '/assets/books/cpp_stevens.jpg',
    category: 'Programming',
    subcategory: 'Mathematics',
    publisher: 'Wiley-India Edition',
    publishedDate: 'January 15, 2010',
    isbn: '978-1234567890',
    pages: 850,
    language: 'English',
    description: 'Comprehensive guide to C++ programming language. This book covers everything from basic syntax to advanced topics like templates and the Standard Template Library. Perfect for both beginners and experienced programmers looking to enhance their C++ skills.',
    availability: 'Available',
    location: 'Section A, Shelf 5',
    reviews: [
      { user: 'David Lee', rating: 5, comment: 'The most practical C++ book I\'ve ever read.' },
      { user: 'Susan Miller', rating: 4, comment: 'Great examples and exercises throughout.' }
    ]
  },
  6: {
    id: 6,
    title: 'Easy C++',
    author: 'Mohammad Azad',
    edition: 'First Edition',
    coverImage: '/assets/books/blue_cpp.png',
    category: 'Programming',
    subcategory: 'Mathematics',
    publisher: 'Academic Press',
    publishedDate: 'March 12, 2018',
    isbn: '978-9876543210',
    pages: 450,
    language: 'English',
    description: 'A simplified approach to learning C++ programming. This book breaks down complex concepts into easy-to-understand chunks, making it ideal for beginners with no prior programming experience.',
    availability: 'Available',
    location: 'Section C, Shelf 2',
    reviews: [
      { user: 'Michael Johnson', rating: 5, comment: 'Perfect for beginners like me!' },
      { user: 'Sarah Williams', rating: 4, comment: 'Clear explanations and good examples.' }
    ]
  },
  7: {
    id: 7,
    title: 'C++ Fundamentals',
    author: 'Mohammad Azad',
    edition: 'First Edition',
    coverImage: '/assets/books/yellow_cpp.png',
    category: 'Programming',
    subcategory: 'Mathematics',
    publisher: 'Tech Publications',
    publishedDate: 'June 20, 2019',
    isbn: '978-5432109876',
    pages: 550,
    language: 'English',
    description: 'This book focuses on the core fundamentals of C++ programming. Learn about variables, data types, control structures, functions, classes, and objects in an easy-to-follow format with plenty of code examples and exercises.',
    availability: 'Checked Out',
    location: 'Section B, Shelf 4',
    reviews: [
      { user: 'Alex Chen', rating: 5, comment: 'Excellent coverage of fundamentals!' },
      { user: 'Emily Davis', rating: 4, comment: 'Very helpful for my computer science class.' }
    ]
  }
};

const SimilarBookCard = ({ book }) => {
  // Extract data properties with fallbacks
  const id = book.id || 1;
  const title = book.title || 'Unknown Title';
  const author = book.author || 'Unknown Author';
  const observation = book.observation || 'Easy to study Mathematical problems';
  
  // Always use static cover image based on book ID
  const getStaticCover = () => {
    const covers = [
      '/assets/books/blue_cpp.png',
      '/assets/books/yellow_cpp.png',
      '/assets/books/cpp_stevens.jpg'
    ];
    return covers[id % covers.length];
  };
  
  return (
    <Link to={`/book/${id}`} className="similar-book-link">
      <div className="similar-book-card">
        <div className="similar-book-cover">
          <img src={getStaticCover()} alt={title} />
        </div>
        <div className="similar-book-info">
          <p className="author">{author}</p>
          <p className="category">
            <span>{title}</span>
            {observation ? (observation.length > 40 ? observation.slice(0, 40) + '...' : observation) : ''}
          </p>
        </div>
      </div>
    </Link>
  );
};

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
          <button className="book-now-button">Book Now</button>
        </div>
        
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