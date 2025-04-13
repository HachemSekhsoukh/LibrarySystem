import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaCircle, FaTimes } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import "../../styles/LibraryHome.css";
import { fetchLatestResources, fetchPopularResources, searchResources } from '../../utils/api';
import BookCard from '../../components/BookCard'
import BookSection from '../../components/BookSection'
import NavHeader from '../../components/NavHeader';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [isFading, setIsFading] = useState(false);
  
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
    '/assets/books/blue_cpp.png',
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
  const [debugMode, setDebugMode] = useState(false);

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
      
      <NavHeader />

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
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading books...</p>
            </div>
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