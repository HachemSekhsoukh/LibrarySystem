import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import logo from "/assets/images/logo2.png";
import "../../styles/UserSignup.css";
import { signupStudent } from '../../utils/api'; // Make sure to adjust the import path based on where you have the function

const UserSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading animation
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Clear previous error messages
    setError('');
    setSuccess('');
  
    // Validate all fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return;
    }
  
    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
  
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Start loading animation
    setIsLoading(true);

    try {
      const response = await signupStudent({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Stop loading animation once the response is received
      setIsLoading(false);

      if (response && response.success) {
        setTimeout(() => {
          navigate('/user/login');
        }, 0);
      } else {
        setError(response?.error || 'Signup failed');
      }
    } catch (error) {
      setIsLoading(false); // Stop loading animation if error occurs
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className='signup-page'>
      <section className="hero-section">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="signup-form">
          <h1 className="signup-title">Sign Up</h1>
          {/* Divider Line */}
          <div className="divider-container3">
            <hr className="nav-bar-divider3" />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Error or Success Message */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button className="sign-in-button" onClick={handleSubmit}>Sign Up</button>

          <div className="sign-up-link">
            <span>Already have an account? </span>
            <a href="/user/login">Sign in</a>
          </div>
        </div>
      </section>

      {/* Loading Animation */}
      {isLoading && (
        <div className="overlay">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default UserSignUp;