import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "/assets/images/logo2.png";
import "../../styles/UserSignup.css";
import { TextField, Autocomplete} from "@mui/material";
import { signupStudent, fetchUserTypes  } from '../../utils/api';

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
  const navigate = useNavigate();

  useEffect(() => {
    const getUserTypes = async () => {
      try {
        const data = await fetchUserTypes();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword, birthdate, phone, type } = formData;

    if (!name || !email || !password || !confirmPassword || !birthdate || !phone || !type) {
      setError('All fields are required.');
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
        setTimeout(() => {
          navigate('/user/login');
        }, 0);
      } else {
        setError(response?.error || 'Signup failed');
      }
    } catch (error) {
      setIsLoading(false);
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
          <div className="divider-container3">
            <hr className="nav-bar-divider3" />
          </div>

          <div className="form-group1">
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

          <div className="form-group1">
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

          <div className="form-group1">
            <label htmlFor="birthdate">Birthdate</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group1">
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

          <div className="form-group1">
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


          <div className="form-group1">
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

          <div className="form-group1">
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

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button className="sign-in-button" onClick={handleSubmit}>Sign Up</button>

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