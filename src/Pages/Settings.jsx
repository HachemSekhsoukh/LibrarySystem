import { useState } from "react";
import "../../src/CSS/Settings.css";
// import photoProfile from "../../../assets/images/profile.png";
import photoProfile from "../../public/assets/images/profile.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from '../utils/userContext';
import React, {useEffect} from 'react';
import { getUserInfo, updateUserInfo  } from  '../utils/api';

const Settings = () => {
  const { user, setUser } = useUser(); // use context
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthdate: "",
    address: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUserInfo();
      if (fetchedUser) {
        setUser(fetchedUser);
        setFormData({
          name: fetchedUser.name || "",
          email: fetchedUser.email || "",
          birthdate: fetchedUser.birthdate || "",
          address: fetchedUser.address || "",
        });
      }
    };
    fetchUser();
  }, [setUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    const { name, email, birthdate, address } = formData;

    if (!name || !email || !birthdate || !address) {
      alert("Please fill in all fields.");
      return;
    }
    setIsLoading(true); // Start loading
    const updatedUser = await updateUserInfo(formData);
    setIsLoading(false); // Stop loading
      if (updatedUser) {
        setUser(updatedUser);
        alert("Profile updated successfully.");
      } else {
        alert("Failed to update profile.");
      }
  };

  const [activeTab, setActiveTab] = useState("edit-profile");
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Add function to toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <>
    {isLoading && (
      <div className="overlay">
        <div className="loader"></div>
      </div>
    )}
    <div className = "settings-page">
        <h1 id="title">Settings</h1>
        <div className="settings-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "edit-profile" ? "active" : ""}`}
            onClick={() => setActiveTab("edit-profile")}
          >
            Edit Profile
          </button>
          <button
            className={`tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        {activeTab === "edit-profile" && (
          <div className="profile-content">
            <div className="profile-section">
              <div className="profile-picture-container">
                <img
                  src={photoProfile}
                  alt="Profile"
                  className="profile-picture"
                />
                <button className="edit-picture-btn">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </div>

              <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name"  value={formData.name}  onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" disabled style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}  value={formData.email}  onChange={handleChange} />
              </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="birthdate"  value={formData.birthdate}  onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Current Address</label>
                  <input type="text" name="address"  value={formData.address}  onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="button-container">
              <button className="save-btn" onClick={handleSaveProfile}>Save</button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="security-container">
            <div className="form-grid">
              <div className="security-content">
                <div className="form-group">
                  <label>Enter your current password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword.oldPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                    />
                    <span
                      className="toggle-password"
                      onClick={() => togglePasswordVisibility("oldPassword")}
                    >
                      {showPassword.oldPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                     placeholder="Enter the new password"
                    />
                    <span
                      className="toggle-password"
                      onClick={() => togglePasswordVisibility("newPassword")}
                    >
                      {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm new password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      placeholder="Confirm the new password"
                    />
                    <span
                      className="toggle-password"
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                    >
                      {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="button-container">
              <button className="save-btn">Update</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
    
  );
};

export default Settings;
