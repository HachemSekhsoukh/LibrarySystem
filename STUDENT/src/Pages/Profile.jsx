import React, { useState, useEffect } from 'react';
import { updateUserInfo,updateUserPassword } from '../utils/api';
import '../CSS/Profile.css';
import NavHeader from '../components/NavHeader';
import { useUser } from '../utils/userContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { debounce } from 'lodash';

const Profile = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: null
  });
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const hasChanges = 
    editData.name !== userData.name ||
    editData.email !== userData.email ||
    editData.phone !== userData.phone;

  useEffect(() => {
    const initializeUserData = () => {
      if (user) {
        const newUserData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          profilePicture: user.profilePicture || null
        };
        setUserData(newUserData);
        setEditData({
          name: newUserData.name,
          email: newUserData.email,
          phone: newUserData.phone
        });
      }
      setLoading(false);
    };

    initializeUserData();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const response = await updateUserInfo(editData);
      
      if (response) {
        setUserData(prev => ({
          ...prev,
          ...editData
        }));
        setIsEditing(false);
        setError('');
      } else {
        throw new Error('Failed to update user data');
      }
    } catch (err) {
      setError(err.message || 'Failed to update user data');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const debouncedValidatePassword = debounce((password) => {
    setPasswordErrors(() => {
      const errors = [];
      if (password.length < 8) errors.push('Password must be at least 8 characters long');
      if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
      if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
      if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character');
      if (password !== passwordData.confirmPassword) 
        errors.push('Passwords do not match');
      return errors;
    });
  }, 300);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  
    if (name === 'newPassword') {
      passwordData.newPassword = value;
      debouncedValidatePassword(value);
      setPasswordStrength(calculatePasswordStrength(value));
    } else if (name === 'confirmPassword') {
      passwordData.confirmPassword = value;
      debouncedValidatePassword(value);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSave = async () => {

    try {
      setSaving(true);
      // TODO: Implement password update API call
      const response = await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      if (!response) {
        throw new Error('Failed to update password');
      }
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      setPasswordErrors([]);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button onClick={() => setError('')}>Try Again</button>
      </div>
    );
  }

  const renderInputField = (label, name, type = 'text') => (
    <div className="info-group">
      <label>{label}</label>
      <div className="info-value">
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={editData[name]}
            onChange={handleInputChange}
            className="profile-input"
          />
        ) : (
          <span>{userData[name]}</span>
        )}
      </div>
    </div>
  );

  const renderPasswordInput = (label, name, field) => (
    <div className="info-group password-input-group">
      <label>{label}</label>
      <div className="password-input-wrapper">
        <input
          type={showPassword[field] ? 'text' : 'password'}
          name={name}
          value={passwordData[name]}
          onChange={handlePasswordChange}
          className="profile-input"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => togglePasswordVisibility(field)}
        >
          {showPassword[field] ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="profile-content-page">
      <NavHeader />
      <div className="profile-container">
        <div className="page-title">
          <h1>Profile Information</h1>
        </div>
        
        <div className="profile-card">
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {userData.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  <span>{userData.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-info-section">
            {renderInputField('Full Name', 'name')}
            {renderInputField('Email Address', 'email', 'email')}
            {renderInputField('Phone Number', 'phone', 'tel')}
            <div className="info-group">
              <label>Account Status</label>
              <div className="info-value">
                <span style={{ color: user.status === 1 ? 'green' : 'red' }}>
                  {user.status === 1 ? 'Active' : 'Inactive (Please contact the library)'}
                </span>
              </div>
            </div>

            <div className="edit-buttons">
              {!isEditing ? (
                <button className="edit-button" onClick={handleEdit}>
                  Edit Information
                </button>
              ) : (
                <>
                  <button 
                    className={`save-button ${!hasChanges ? 'disabled' : ''}`} 
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? <LoadingSpinner size="small" color="#ffffff" /> : 'Save Changes'}
                  </button>
                  <button className="cancel-button" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                </>
              )}
            </div>

            <div className="password-section">
              <h3>Password Settings</h3>
              {!isEditingPassword ? (
                <div className="info-group">
                  <label>Password</label>
                  <div className="info-value">
                    <span>••••••••</span>
                  </div>
                  <button className="edit-button" onClick={() => setIsEditingPassword(true)}>
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="info-group">
                  {renderPasswordInput('Current Password', 'currentPassword', 'current')}
                  {renderPasswordInput('New Password', 'newPassword', 'new')}
                  {renderPasswordInput('Confirm New Password', 'confirmPassword', 'confirm')}

                  {passwordData.newPassword && (
                    <div className="password-strength">
                      <div className="strength-indicator">
                        {[...Array(4)].map((_, index) => (
                          <div
                            key={index}
                            className={`strength-bar ${index < passwordStrength ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="strength-text">
                        {passwordStrength === 0 ? 'Very Weak' :
                         passwordStrength === 1 ? 'Weak' :
                         passwordStrength === 2 ? 'Medium' :
                         passwordStrength === 3 ? 'Strong' : 'Very Strong'}
                      </span>
                    </div>
                  )}

                  {passwordErrors.length > 0 && (
                    <div className="password-errors">
                      {passwordErrors.map((error, index) => (
                        <div key={index} className="error-message">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="edit-buttons">
                    <button 
                      className={`save-button ${(passwordErrors.length > 0) ? 'disabled' : ''}`} 
                      onClick={handlePasswordSave}
                      disabled={passwordErrors.length > 0 || saving}
                    >
                      {saving ? <LoadingSpinner size="small" color="#ffffff" /> : 'Update Password'}
                    </button>
                    <button 
                      className="cancel-button" 
                      onClick={handlePasswordCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;