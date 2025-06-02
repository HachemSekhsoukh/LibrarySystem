import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaUser, FaBars, FaTimes, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa';
import '../CSS/NavHeader.css';
import "../CSS/components/NavBar.css";
import "../CSS/components/header.css";
import { logoutStudent, getUserInfo } from '../utils/api';
import { useUser } from '../utils/userContext';


const NavHeader = () => {
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { user } = useUser();
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setUserName(user.name);
  }, []); // Empty dependency array means this runs once when component mounts

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = async (e) => {
    setError('');
    console.log('Logging out...');
    try {
      const response = await logoutStudent();
      console.log('Logout response:', response);
      
      // Check if we got a successful logout message
      if (response && response.message === "Logged out successfully") {
        // Show success message
        setSuccess('Logging out...');
        // Clear user context and localStorage
        setUser(null);
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/user/login');
        }, 1000);
      } else {
        setError('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="nav-header">
      <div className="logo_ensia">
        <img src="../public/assets/images/logo3.png" alt="ENSIA Logo" />
      </div>
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      <nav className={`main-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li>
            <Link 
              to="/library" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={isActive('/library') ? 'active' : ''}
            >
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li>
          <Link 
              to="/history" 
              onClick={() => setIsProfileOpen(false)}
              className={isActive('/history') ? 'active' : ''}
            >
              <FaHistory className="nav-icon" />
              <span>History</span>
            </Link>
          </li>
          {isMobileMenuOpen && 
          <li>
          <Link 
              to="/profile" 
              onClick={() => setIsProfileOpen(false)}
              className={isActive('/profile') ? 'active' : ''}
            >
              <FaUser className="nav-icon" />
              <span>Profile</span>
            </Link>
          </li>}
          {isMobileMenuOpen && 
          <li>
          <Link  
              onClick={async () => await handleLogout()}
              className="logout-button"
            >
              <FaSignOutAlt className="nav-icon" />
              <span>Logout</span>
            </Link>
          </li>}
          {!isMobileMenuOpen &&
          <li className="profile-dropdown">
            <button 
              className={`profile-button ${isActive('/profile') || isActive('/settings') ? 'active' : ''}`} 
              onClick={toggleProfile}
            >
              <FaUser className="nav-icon" />
               <span>{userName || 'Profile'}</span>
            </button>
            {(isProfileOpen || isMobileMenuOpen) && (
              <div className="profile-menu">
                <Link 
                  to="/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className={isActive('/profile') ? 'active' : ''}
                >
                  <FaUser className="nav-icon" />
                  <span>Profile</span>
                </Link>
                <button onClick={async () => await handleLogout()} className="logout-button">
                  <FaSignOutAlt className="nav-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </li>
          }
        </ul>
      </nav>
    </header>
  );
};

export default NavHeader; 