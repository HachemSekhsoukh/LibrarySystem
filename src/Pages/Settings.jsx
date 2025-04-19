import { useState } from "react";
import "../../src/CSS/Settings.css";
// import photoProfile from "../../../assets/images/profile.png";
import photoProfile from "../../public/assets/images/profile.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from '../utils/userContext';
import { useTranslation } from "react-i18next";
import React, { useEffect } from 'react';
import { getUserInfo, updateUserInfo, updateUserPassword } from  '../utils/api';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUser(); // use context
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthdate: "",
    address: "",
  });

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

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

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;
  
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("error_empty"));
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setPasswordError(t("error_mismatch"));
      return;
    }
  
    setPasswordError(""); // Clear any previous error
    setIsLoading(true);
  
    const result = await updateUserPassword(oldPassword, newPassword);
  
    setIsLoading(false);
  
    if (result && result.success) {
      alert(t("success_password_updated"));
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setPasswordError(t("error_update_failed"));
    }
  };

  const handleSaveProfile = async () => {
    const { name, email, birthdate, address } = formData;

    if (!name || !email || !birthdate || !address) {
      alert(t("error_fill_all"));
      return;
    }
    setIsLoading(true); // Start loading
    const updatedUser = await updateUserInfo(formData);
    setIsLoading(false); // Stop loading
    if (updatedUser) {
      setUser(updatedUser);
      alert(t("success_profile_update"));
    } else {
      alert(t("error_profile_update"));
    }
  };

  const [activeTab, setActiveTab] = useState("edit-profile");
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

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
    <div className="settings-page">
        <h1 id="title">{t("settings")}</h1>
        <div className="settings-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "edit-profile" ? "active" : ""}`}
            onClick={() => setActiveTab("edit-profile")}
          >
            {t("edit_profile")}
          </button>
          <button
            className={`tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            {t("security")}
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
                  <label>{t("full_name")}</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>{t("email")}</label>
                  <input type="email" name="email" disabled style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }} value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>{t("date_of_birth")}</label>
                  <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>{t("current_address")}</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <div className="language-selector">
                    <label htmlFor="language">{t("language")}:</label>
                    <select id="language" onChange={handleLanguageChange} value={i18n.language}>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                </div>
              </div>
            </div>

            <div className="button-container">
              <button className="save-btn" onClick={handleSaveProfile}>{t("save")}</button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
            <div className="security-container">
              <div className="form-grid">
                <div className="security-content">
                  <div className="form-group">
                    <label>{t("current_password_label")}</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword.oldPassword ? "text" : "password"}
                        placeholder={t("current_password_placeholder")}
                        value={passwordData.oldPassword}
                        onChange={(e) =>
                          {
                            setPasswordData({
                              ...passwordData,
                              oldPassword : e.target.value,
                            })
                            setPasswordError(""); // Clear error on input
                          }
                        }
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
                    <label>{t("new_password_label")}</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword.newPassword ? "text" : "password"}
                        placeholder={t("new_password_placeholder")}
                        value={passwordData.newPassword}
                        onChange={(e) =>{
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                          setPasswordError(""); // Clear error on input
                        }}
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
                    <label>{t("confirm_password_label")}</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        placeholder={t("confirm_password_placeholder")}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>{
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                          setPasswordError(""); // Clear error on input
                        }}
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
              
              {passwordError && (
                <div style={{ color: "red", marginTop: "10px", fontSize: "0.9em" }}>
                  {passwordError}
                </div>
              )}

              <div className="button-container">
                <button className="save-btn" onClick={handleChangePassword}>{t("update")}</button>
              </div>
            </div>
          )}
      </div>
    </div>
    </>
  );
};

export default Settings;