import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import logo from "/assets/images/logo2.png";
import "../CSS/UserSignup.css";
import { TextField, Autocomplete} from "@mui/material";
import { signupStudent, fetchUserTypes  } from '../utils/api';

const UserSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    phone: '',
    type: '' 
  });
  const [userTypes, setUserTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserTypes = async () => {
      try {
        const data = await fetchUserTypes();
        console.log("data ");
        console.log(data);

        setUserTypes(data);
      } catch (error) {
        console.error("Failed to load user types:", error);
      }
    };

    getUserTypes();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    console.log(formData);
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setError(''); // Clear any previous errors when CAPTCHA is completed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword, birthdate, phone, type } = formData;

    if (!name || !email || !password || !confirmPassword || !birthdate || !phone || !type) {
      setError('All fields are required.');
      return;
    }

    if (!captchaValue) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const phonePattern = /^[0-9]{8,15}$/;
    if (!phonePattern.test(phone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await signupStudent({
        name,
        email,
        password,
        birthdate,
        phone,
        type
      });

      setIsLoading(false);

      if (response && response.success) {
        setSuccess('Signup successful! You can now login.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          birthdate: '',
          phone: '',
          type: ''
        });
        // Reset CAPTCHA
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
      } else {
        setError(response?.error || 'Signup failed');
        // Reset CAPTCHA on failed signup
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
      }
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred. Please try again.');
      // Reset CAPTCHA on error
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
    }
  };

  return (
    <div className='signup-page'>
      <section className="hero-section">
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
        <div className="floating-shape shape4"></div>
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="signup-form">
          <h1 className="signup-title">Sign Up</h1>
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
            <label htmlFor="birthdate">Birthdate</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
                        <label>User Type</label>
                        <Autocomplete
                          fullWidth
                          options={userTypes}
                          value={formData.type}
                          onChange={(event, newValue) => {
                            setFormData((prevData) => ({
                              ...prevData,
                              type: newValue
                            }));
                          }}                          
                          getOptionLabel={(option) => {
                            if (typeof option === 'string') {
                              return option;
                            }
                            return option.name || '';
                          }}
                          isOptionEqualToValue={(option, value) => {
                            if (!option || !value) return false;
                            if (typeof option === 'object' && typeof value === 'object') {
                              return option.id === value.id;
                            }
                            return option === value;
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              placeholder="Select user type"
                              variant="outlined"
                              className="text-field"
                            />
                          )}
                          className="dropdown-field"
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

          <div className="captcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test site key for localhost
              onChange={handleCaptchaChange}
              theme="light"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            className="sign-in-button" 
            onClick={handleSubmit}
            disabled={!captchaValue}
          >
            Sign Up
          </button>

          <div className="sign-up-link">
            <span>Already have an account? </span>
            <a href="/user/login">Sign in</a>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="overlay">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default UserSignUp;