import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaList, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/NavHeader.css';

const NavHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="nav-header">
      <div className="logo">
        <img src="../public/assets/images/logo.png" alt="ENSIA Logo" />
      </div>
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      <nav className={`main-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li>
            <Link to="/library" onClick={() => setIsMobileMenuOpen(false)}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)}>
              <FaList className="nav-icon" />
              <span>Categories</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <FaUser className="nav-icon" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavHeader; 