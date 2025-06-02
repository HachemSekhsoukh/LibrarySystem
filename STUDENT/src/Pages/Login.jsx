import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import logo from "/assets/images/logo2.png";
import "../CSS/UserLogin.css";
import { loginStudent, getUserInfo,fetchLoginAttempts, updateLoginAttempts } from '../utils/api';
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
    let loginAttempts = null;
    
    try {
      // Check login attempts first
      loginAttempts = await fetchLoginAttempts(formData.email);
      console.log("loginAttempts top top");
      console.log(loginAttempts);
      
      if (loginAttempts) {
        const now = new Date();
        
        // If there's a blocked_until timestamp, check if we're still blocked
        if (loginAttempts.blocked_until) {
          const blockedUntil = new Date(loginAttempts.blocked_until);
          console.log("blockedUntil");
          console.log(blockedUntil);
          console.log("now");
          console.log(now);
          console.log("now < blockedUntil");
          console.log(now < blockedUntil);
          if (now < blockedUntil) {
            setError(`Too many login attempts. Please try again after ${blockedUntil}`);
            setIsLoading(false);
            return;
          } else {
            // If block has expired, reset the attempt count
            await updateLoginAttempts(formData.email, 0, null);
            loginAttempts.login_attempt_count = 0;
          }
        }

        // Check if we've reached 5 attempts in the current hour
        if (loginAttempts.login_attempt_count >= 5) {
          // Set blocked_until to 1 hour from now
          const blockedUntil = new Date(now.getTime() + 60 * 60 * 1000);
          // Format as ISO string with timezone for timestamptz
          const blockedUntilISO = blockedUntil.toISOString();
          console.log("blockedUntil ISO:", blockedUntilISO);
          await updateLoginAttempts(formData.email, loginAttempts.login_attempt_count, blockedUntilISO);
          setError(`Too many login attempts. Please try again after ${blockedUntil}`);
          setIsLoading(false);
          return;
        }
      }

      // Proceed with login if attempts are within limits
      const loginResponse = await loginStudent(formData.email, formData.password);
      
      if (loginResponse && loginResponse.success) {
        // Reset login attempts on successful login
        await updateLoginAttempts(formData.email, 0, null);
        
        // Then fetch complete user info
        const userData = await getUserInfo();
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
        // Increment login attempts on failed login

        const newAttemptCount = (loginAttempts?.login_attempt_count || 0) + 1;

        await updateLoginAttempts(formData.email, newAttemptCount, null);
        setError(loginResponse?.error || 'Invalid credentials');
        // Reset CAPTCHA on failed login
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Increment login attempts on error
      const newAttemptCount = (loginAttempts?.login_attempt_count || 0) + 1;
      await updateLoginAttempts(formData.email, newAttemptCount, null);
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
