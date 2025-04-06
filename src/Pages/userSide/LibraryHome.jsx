import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaCircle } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import '../../styles/LibraryHome.css';
import BookSection from '../../components/BookSection';

// Book data - normally this would come from an API
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



const BookShowcase = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // Move in the opposite direction (right to left)
      setCurrentIndex((prevIndex) => (prevIndex - 1 + books.length) % books.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [books.length]);

  // Calculate positions for all books
  const getPositionStyles = (index) => {
    // Calculate relative position (-1, 0, 1) for (left, center, right)
    const relativePosition = ((index - currentIndex + books.length) % books.length);
    
    // Only show 3 books at a time
    if (relativePosition > 1 && relativePosition < books.length - 1) {
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
    } else if (relativePosition === books.length - 1) {
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

  // Create springs for each book
  const bookSprings = books.map((_, index) => {
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
        {books.map((book, index) => (
          <animated.div 
            key={book.id} 
            className="showcase-book-wrapper"
            style={bookSprings[index]}
          >
            <Link 
              to={`/book/${book.id}`} 
              className="showcase-book"
            >
              <img src={book.coverImage} alt={book.title} />
            </Link>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

const LibraryHome = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="library-home">
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

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Latest Books !</h1>
            <p>Stay curious, keep reading – Check out the <br /> latest books!</p>
          </div>
          
          <BookShowcase books={bookData.slice(0, 3)} />
          
          <p className="library-info">Explore a collection of +2000 books in ENSIA's Library.</p>
        </div>
        
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Title, Author or ISBN ..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </form>
      </section>

      <main className="main-content">
        <BookSection title="Latest Books" books={[bookData[0]]} />
        <BookSection title="Popular Books" books={[bookData[0]]} />
      </main>
    </div>
  );
};

export default LibraryHome; 