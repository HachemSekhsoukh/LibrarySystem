import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "/assets/images/logo2.png";
import "../../styles/UserLogin.css";
import { loginStudent } from '../../utils/api'; // Adjust path if needed

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Both email and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginStudent(formData.email,formData.password);
      setIsLoading(false);

      if (response && response.success) {
        // Redirect after successful login
        navigate('/library'); // Change to your actual route
      } else {
        setError(response?.error || 'Invalid credentials');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='login-page'>
      <section className="hero-section">
        <div className="logo">
          <img src={logo} alt="الوكالة الوطنية للمقاول الذاتي" />
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

          {error && <div className="error-message">{error}</div>}

          <button className="sign-in-button" type="submit">Sign In</button>

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
