import { useState } from "react";
import "../../src/CSS/Settings.css";
// import photoProfile from "../../../assets/images/profile.png";
import photoProfile from "../../public/assets/images/profile.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const TestingSetting = () => {
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
                  <input type="text" defaultValue="BILAL WAZIR" />
                </div>

                <div className="form-group">
                  <label>User Name</label>
                  <input type="text" defaultValue="BILAL" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue="BILAL@gmail.com" />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword.oldPassword ? "text" : "password"}
                      defaultValue="password is here"
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
                  <label>Date of Birth</label>
                  <input type="text" defaultValue="25 January 2986" />
                </div>

                <div className="form-group">
                  <label>Present Address</label>
                  <input type="text" defaultValue="Maalma, Algiers, DZ" />
                </div>
              </div>
            </div>

            <div className="button-container">
              <button className="save-btn">Save</button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="security-container">
            <div className="form-grid">
              <div className="security-content">
                <div className="form-group">
                  <label>Old Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword.oldPassword ? "text" : "password"}
                      defaultValue="password is here"
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
                      defaultValue="password is here"
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
                  <label>Confirm Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      defaultValue="password is here"
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
              <button className="save-btn">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default TestingSetting;
