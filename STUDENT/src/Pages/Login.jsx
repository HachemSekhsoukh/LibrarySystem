import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import logo from "/assets/images/logo2.png";
import "../CSS/UserLogin.css";
import { loginStudent, getUserInfo } from '../utils/api';
import { useUser } from '../utils/userContext';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [success, setSuccess] = useState('');
  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setError(''); // Clear any previous errors when CAPTCHA is completed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Both email and password are required.');
      return;
    }

    if (!captchaValue) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setIsLoading(true);
    try {
      // First login the user
      const loginResponse = await loginStudent(formData.email, formData.password);
      
      if (loginResponse && loginResponse.success) {
        // Then fetch complete user info
        const userData = await getUserInfo();
        console.log("userData after login");
        console.log(userData);
        if (userData) {
          // Set the complete user data in context
          setUser(userData);
          // Show success message and redirect after delay
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/library');
          }, 1500);
        } else {
          setError('Failed to fetch user information');
        }
      } else {
        setError(loginResponse?.error || 'Invalid credentials');
        // Reset CAPTCHA on failed login
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      // Reset CAPTCHA on error
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <section className="hero-section-login">
        
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
        <div className="logo">
          <img src={logo} alt="ENSIA" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-title">Sign In</h1>

          {/* Divider Line */}
          <div className="divider-container2">
            <hr className="nav-bar-divider2" />
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

          <div className="captcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test site key for localhost
              onChange={handleCaptchaChange}
              theme="light"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            className="sign-in-button" 
            type="submit"
            disabled={!captchaValue}
          >
            Sign In
          </button>

          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>

          <div className="sign-up-link">
            <span>Don't have an account? </span>
            <a href="/user/sign-up">Sign up</a>
          </div>
        </form>
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

export default UserLogin;
