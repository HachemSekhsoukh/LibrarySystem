import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaCircle, FaTimes } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import '../../styles/LibraryHome.css';
import { fetchLatestResources, fetchPopularResources, searchResources } from '../../utils/api';
import BookCard from '../../components/BookCard'
import BookSection from '../../components/BookSection'

// Book data for fallback (will be replaced by API data)
const bookData = [
  {
    id: 1,
    title: 'The C++ Programming Language',
    author: 'Bjarne Stroustrup',
    edition: 'Fourth Edition',
    coverImage: '/assets/books/blue_cpp.png',
    category: 'Mathematics'
  },
  {
    id: 2,
    title: 'C++ A Beginner\'s Guide',
    author: 'Herbert Schildt',
    edition: 'Second Edition',
    coverImage: '/assets/books/yellow_cpp.png',
    category: 'Mathematics'
  },
  {
    id: 3,
    title: 'C++ Programming',
    author: 'Al Stevens',
    edition: '7th Edition',
    coverImage: '/assets/books/cpp_stevens.jpg',
    category: 'Mathematics'
  }
];

// Make sure we're using the right image
bookData[0].coverImage = '/assets/books/blue_cpp.png';


const DebugSection = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid red', display: 'block', background: 'white' }}>
      <h3>{title} - Debug Data</h3>
      <p>Count: {data.length}</p>
      <p>First item: {data[0] ? (data[0].title || data[0].r_title || 'No title') : 'No data'}</p>
      <details>
        <summary>View Full Data</summary>
        <pre style={{ overflow: 'auto', maxHeight: '200px' }}>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
};



const BookShowcase = ({ books = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  
  // Ensure we always have at least 3 books for the showcase
  const displayBooks = useMemo(() => {
    const result = [...books];
    while (result.length < 3) {
      result.push(bookData[result.length % bookData.length]);
    }
    return result.slice(0, 3); // Always use exactly 3 books
  }, [books]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // Move in the opposite direction (right to left)
      setCurrentIndex((prevIndex) => (prevIndex - 1 + displayBooks.length) % displayBooks.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [displayBooks.length]);

  // Calculate positions for all books
  const getPositionStyles = (index) => {
    // Calculate relative position (-1, 0, 1) for (left, center, right)
    const relativePosition = ((index - currentIndex + displayBooks.length) % displayBooks.length);
    
    // Only show 3 books at a time
    if (relativePosition > 1 && relativePosition < displayBooks.length - 1) {
      return { display: 'none' };
    }
    
    let xPos = 0;
    let scale = 1;
    let zIndex = 1;
    let opacity = 1;
    let rotateY = 0;
    
    if (relativePosition === 0) {
      // Center book
      xPos = 0;
      scale = 1.1;
      zIndex = 3;
      rotateY = 0;
    } else if (relativePosition === 1) {
      // Right book
      xPos = 250;
      scale = 0.8;
      zIndex = 1;
      opacity = 0.8;
      rotateY = -8;
    } else if (relativePosition === displayBooks.length - 1) {
      // Left book
      xPos = -250;
      scale = 0.8;
      zIndex = 1;
      opacity = 0.8;
      rotateY = 8;
    } else {
      // Hidden books
      opacity = 0;
    }
    
    return {
      transform: `translateX(${xPos}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex,
      opacity
    };
  };

  // Create springs for each book - always create exactly 3
  const bookSprings = displayBooks.map((_, index) => {
    return useSpring({
      to: getPositionStyles(index),
      config: { 
        mass: 1.2, 
        tension: 220, 
        friction: 26,
        clamp: false,
        precision: 0.01
      },
      immediate: false
    });
  });

  return (
    <div className="book-showcase-container">
      <div className="book-showcase">
        {displayBooks.map((book, index) => {
          const id = book.id || index;
          const title = book.title || 'Unknown Title';
          
          // Always use static cover image based on book ID
          const getStaticCoverImage = () => {
            const coverImages = [
              '/assets/books/blue_cpp.png',
              '/assets/books/yellow_cpp.png', 
              '/assets/books/cpp_stevens.jpg'
            ];
            return coverImages[id % coverImages.length];
          };
          
          return (
            <animated.div 
              key={id} 
              className="showcase-book-wrapper"
              style={bookSprings[index]}
            >
              <Link 
                to={`/book/${id}`} 
                className="showcase-book"
              >
                <img 
                  src={getStaticCoverImage()} 
                  alt={title} 
                />
              </Link>
            </animated.div>
          );
        })}
      </div>
    </div>
  );
};

const SearchResults = ({ results, closeSearch }) => {
  if (!results || results.length === 0) {
    return (
      <div className="search-results-container">
        <div className="search-results-header">
          <h2>Search Results</h2>
          <button className="close-search" onClick={closeSearch}>
            <FaTimes />
          </button>
        </div>
        <p>No results found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2>Search Results ({results.length})</h2>
        <button className="close-search" onClick={closeSearch}>
          <FaTimes />
        </button>
      </div>
      <div className="search-results-grid">
        {results.map((book, index) => (
          <BookCard key={index} book={book} />
        ))}
      </div>
    </div>
  );
};

const LibraryHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [latestBooks, setLatestBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(true); // Enable debug mode by default

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        
        // Fetch latest and popular books
        const latestData = await fetchLatestResources(5);
        const popularData = await fetchPopularResources(5);
        
        console.log('Latest books data:', latestData);
        console.log('Popular books data:', popularData);
        
        // Only use the database data, no fallback unless absolutely necessary
        if (latestData && latestData.length > 0) {
          setLatestBooks(latestData);
        } else {
          console.warn('No latest books found in database, using fallback data');
          setLatestBooks(bookData);
        }
        
        if (popularData && popularData.length > 0) {
          setPopularBooks(popularData);
        } else {
          console.warn('No popular books found in database, using fallback data');
          setPopularBooks(bookData);
        }
        
        console.log('Final latest books state:', latestData.length > 0 ? latestData : bookData);
      } catch (error) {
        console.error('Error fetching books:', error);
        // Only fallback to static data on actual error
        console.warn('API error, using fallback data');
        setLatestBooks(bookData);
        setPopularBooks(bookData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();

    // Toggle debug mode with keyboard shortcut (Ctrl+D)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await searchResources(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const closeSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  // Only show main content when not displaying search results
  const showMainContent = searchResults.length === 0;

  return (
    <div className="library-home">
      {/* Add debugging sections */}
      {debugMode && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
          <h2>Debug Mode (Press Ctrl+D to toggle)</h2>
          <DebugSection data={latestBooks} title="Latest Books" />
          <DebugSection data={popularBooks} title="Popular Books" />
          {searchResults.length > 0 && (
            <DebugSection data={searchResults} title="Search Results" />
          )}
        </div>
      )}
      
      <header className="nav-header">
        <div className="logo">
          <img src="assets/images/logo.png" alt="ENSIA Library Logo" />
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

      {showMainContent && (
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Latest Books !</h1>
              <p>Stay curious, keep reading – Check out the <br /> latest books!</p>
            </div>

            <BookShowcase books={latestBooks} />
            
            <p className="library-info">Explore a collection of +2000 books in ENSIA's Library.</p>
          </div>
          
          <form className="search-bar1" onSubmit={handleSearchSubmit}>
            <div className="search-input1">
              <FaSearch className="search-icon1" />
              <input
                type="text"
                placeholder="Search by Title, Author or ISBN ..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {isSearching && <span className="searching-indicator">Searching...</span>}
            </div>
          </form>
        </section>
      )}
      
      {searchResults.length > 0 ? (
        <SearchResults results={searchResults} closeSearch={closeSearch} />
      ) : (
        <main className={`main-content ${showMainContent ? '' : 'hidden'}`}>
          {isLoading ? (
            <div className="loading">Loading books...</div>
          ) : (
            <>
              <BookSection title="Latest Books" books={latestBooks} />
              <BookSection title="Popular Books" books={popularBooks} />
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default LibraryHome; 