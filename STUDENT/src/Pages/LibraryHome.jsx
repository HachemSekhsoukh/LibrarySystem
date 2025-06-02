import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaCircle, FaTimes } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import "../CSS/LibraryHome.css";
import "../../src/CSS/Settings.css";
import { fetchLatestResources, fetchPopularResources, searchResources, getUserInfo, submitSuggestion } from '../utils/api';
import BookCard from '../components/BookCard'
import BookSection from '../components/BookSection'
import NavHeader from '../components/NavHeader';
import {useUser} from '../utils/userContext';


const BookShowcase = ({ books = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [isFading, setIsFading] = useState(false);
  const { user } = useUser();
  
  // Ensure we have at least 3 books for the showcase on desktop, 1 for mobile
  const displayBooks = useMemo(() => {
    if (isMobile) {
      return books; // Show all books for mobile cycling
    }
    return books.slice(0, 3); // Show up to 3 books for desktop
  }, [books, isMobile]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (books.length === 0) return;
    
    const timer = setInterval(() => {
      if (isMobile) {
        setIsFading(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % displayBooks.length);
          setIsFading(false);
        }, 500); // Match the fade-out animation duration
      } else {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayBooks.length);
      }
    }, isMobile ? 3000 : 4000); // 3 seconds for mobile, 4 seconds for desktop
    
    return () => clearInterval(timer);
  }, [books.length, displayBooks.length, isMobile]);

  // Calculate positions for all books (desktop only)
  const getPositionStyles = (index) => {
    if (isMobile) return {};
    
    const relativePosition = ((index - currentIndex + displayBooks.length) % displayBooks.length);
    
    if (relativePosition > 1 && relativePosition < displayBooks.length - 1) {
      return { display: 'none' };
    }
    
    let xPos = 0;
    let scale = 1;
    let zIndex = 1;
    let opacity = 1;
    let rotateY = 0;
    
    if (relativePosition === 0) {
      xPos = 0;
      scale = 1.1;
      zIndex = 3;
      rotateY = 0;
    } else if (relativePosition === 1) {
      xPos = 250;
      scale = 0.8;
      zIndex = 1;
      opacity = 0.8;
      rotateY = -8;
    } else if (relativePosition === displayBooks.length - 1) {
      xPos = -250;
      scale = 0.8;
      zIndex = 1;
      opacity = 0.8;
      rotateY = 8;
    } else {
      opacity = 0;
    }
    
    return {
      transform: `translateX(${xPos}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex,
      opacity
    };
  };

  // Create springs for each book (desktop only)
  const spring1 = useSpring({
    to: getPositionStyles(0),
    config: { 
      mass: 1.2, 
      tension: 220, 
      friction: 26,
      clamp: false,
      precision: 0.01
    },
    immediate: false
  });

  const spring2 = useSpring({
    to: getPositionStyles(1),
    config: { 
      mass: 1.2, 
      tension: 220, 
      friction: 26,
      clamp: false,
      precision: 0.01
    },
    immediate: false
  });

  const spring3 = useSpring({
    to: getPositionStyles(2),
    config: { 
      mass: 1.2, 
      tension: 220, 
      friction: 26,
      clamp: false,
      precision: 0.01
    },
    immediate: false
  });

  const bookSprings = [spring1, spring2, spring3];

  if (displayBooks.length === 0) return null;

  return (
    <div className="book-showcase-container">
      <div className="book-showcase">
        {isMobile ? (
          // Mobile view - show one book at a time with fade
          <animated.div 
            key={currentIndex}
            className={`showcase-book-wrapper ${isFading ? 'fade-out' : 'fade-in'}`}
            style={{
              transform: 'translateX(0) scale(1)'
            }}
          >
            <Link 
              to={`/book/${displayBooks[currentIndex]?.id || 0}`} 
              className="showcase-book"
            >
              <img 
                src={getStaticCoverImage(displayBooks[currentIndex]?.id || 0)} 
                alt={displayBooks[currentIndex]?.title || 'Unknown Title'} 
              />
            </Link>
          </animated.div>
        ) : (
          // Desktop view - show sliding books
          displayBooks.map((book, index) => {
            const id = book.id || index;
            const title = book.title || 'Unknown Title';
            
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
                    src={getStaticCoverImage(id)} 
                    alt={title} 
                  />
                </Link>
              </animated.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Helper function for cover images
const getStaticCoverImage = (id) => {
  const coverImages = [
    '/assets/books/yellow_cpp.png', 
    '/assets/books/cpp_stevens.jpg'
  ];
  return coverImages[id % coverImages.length];
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
      {console.log(results)}
      {results.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
      </div>
    </div>
  );
};

const SuggestionForm = () => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { user } = useUser();

  const handleSuggestionChange = (e) => {
    setSuggestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) {
      setMessage({ text: 'Please enter your suggestion', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const result = await submitSuggestion(user.id, suggestion);
      setMessage({ text: 'Suggestion submitted successfully!', type: 'success' });
      setSuggestion('');
    } catch (error) {
      setMessage({ text: error.message || 'Failed to submit suggestion', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="suggestion-section">
      <h2>Have a Suggestion?</h2>
      <p>We'd love to hear your ideas to improve our library!</p>
      
      <div className="suggestion-form">
        <div className="form-group">
          <label htmlFor="suggestion">Your Suggestion</label>
          <textarea
            id="suggestion"
            name="suggestion"
            value={suggestion}
            onChange={handleSuggestionChange}
            required
            placeholder="Share your ideas with us..."
            rows="4"
          />
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <button 
          onClick={handleSubmit}
          className="submit-button"
          disabled={loading || !suggestion.trim()}
        >
          {loading ? 'Submitting...' : 'Submit Suggestion'}
        </button>
      </div>
    </section>
  );
};

const LibraryHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [latestBooks, setLatestBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        
        // Fetch latest and popular books
        const latestData = await fetchLatestResources(5);
        const popularData = await fetchPopularResources(5);
        
        console.log('Latest books data:', latestData);
        console.log('Popular books data:', popularData);
        
        setLatestBooks(latestData || []);
        setPopularBooks(popularData || []);
        
      } catch (error) {
        console.error('Error fetching books:', error);
        setLatestBooks([]);
        setPopularBooks([]);
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

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedSuggestion(-1);
    if (query.trim().length >= 2) {
      try {
        setIsSearching(true);
        const results = await searchResources(query);
        setSearchSuggestions(results.slice(0, 5));
      } catch (error) {
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (book) => {
    setSearchQuery(book.title);
    setSearchSuggestions([]);
    setHighlightedSuggestion(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (searchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedSuggestion(prev => (prev + 1) % searchSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedSuggestion(prev => (prev - 1 + searchSuggestions.length) % searchSuggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedSuggestion >= 0 && highlightedSuggestion < searchSuggestions.length) {
        e.preventDefault();
        const selectedTitle = searchSuggestions[highlightedSuggestion].title;
        setSearchQuery(selectedTitle);
        setSearchSuggestions([]);
        setHighlightedSuggestion(-1);
        // Immediately submit the search
        handleSearchSubmit({ preventDefault: () => {} });
      }
    } else if (e.key === 'Escape') {
      setSearchSuggestions([]);
      setHighlightedSuggestion(-1);
    }
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
      setSearchSuggestions([]);
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
  const showMainContent = true;

  return (
    <div className="library-home">
      
      <NavHeader />

      {showMainContent && (
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Latest Books!</h1>
              <p>Stay curious, keep reading – Check out the latest books!</p>
            </div>

            <BookShowcase books={latestBooks} />
            
            <p className="library-info">Explore a collection of +2000 books in ENSIA's Library.</p>
          </div>
          
          <div className="search-container">
            <form className="search-form" onSubmit={handleSearchSubmit} autoComplete="off">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Title, Author or ISBN ..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  ref={searchInputRef}
                  aria-autocomplete="list"
                  aria-controls="search-suggestions-list"
                  aria-activedescendant={highlightedSuggestion >= 0 ? `suggestion-${highlightedSuggestion}` : undefined}
                />
                {isSearching && <span className="searching-indicator">Searching...</span>}
              </div>
              {searchSuggestions.length > 0 && (
                <div className="search-suggestions" id="search-suggestions-list" role="listbox">
                  {searchSuggestions.map((book, index) => (
                    <div 
                      key={index} 
                      id={`suggestion-${index}`}
                      className={`suggestion-item${highlightedSuggestion === index ? ' highlighted' : ''}`}
                      onClick={() => handleSuggestionClick(book)}
                      role="option"
                      aria-selected={highlightedSuggestion === index}
                    >
                      {book.title}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </section>
      )}
      
      {searchResults.length > 0 && (
        <div className="search-modal-overlay">
          <div className="search-modal">
            <SearchResults results={searchResults} closeSearch={closeSearch} />
          </div>
        </div>
      )}
      <main className="main-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : (
          <>
            <BookSection title="Latest Books" books={latestBooks} />
            <BookSection title="Popular Books" books={popularBooks} />
            <SuggestionForm />
          </>
        )}
      </main>
    </div>
  );
};

export default LibraryHome; 