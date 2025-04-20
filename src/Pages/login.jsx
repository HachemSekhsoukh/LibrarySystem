import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../src/CSS/login.css";
import logo from "/assets/images/logo2.png";
import bgLogin from "../../public/assets/images/bg-login.png";
import { loginUser } from "../utils/api";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
      const saved = localStorage.getItem("darkMode");
      return saved === "true"; // default to false if null
    });
  
  useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.trim()) newErrors.email = t("email_required");
    if (!password) newErrors.password = t("password_required");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email, password);
      if (data && data.success) {
        navigate("/dashboard");
      } else {
        setErrors({ password: data?.error || t("login_failed") });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ password: t("login_error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="overlay">
          <div className="loader"></div>
        </div>
      )}
      <div className="login-container">
        <div className="top-section" style={{ backgroundImage: `url(${bgLogin})` }}>
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>

          <div className="welcome-text">
            <h1 className="welcome">{t("welcome")}</h1>
            <h2>{t("system_name")}</h2>
          </div>
        </div>

        <div className="bottom-section">
          <div className="login-card">
            <h2>{t("sign_in")}</h2>

            <form className="login-form1" onSubmit={handleLogin}>
              <div className="form-group1">
                <label>{t("email")}</label>
                <input
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group1">
                <label>{t("password")}</label>
                <input
                  type="password"
                  placeholder={t("password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <button type="submit" className="signin-btn1">
                {t("sign_in")}
              </button>
            </form>
          </div>

          <footer>
            <div className="footer-content">
              <div className="footer-left">
                {t("made_with_love")}
              </div>
              <div className="footer-right">
                <a href="#">{t("contact_us")}</a>
                <a href="#">{t("address")}</a>
                <a href="#">{t("license")}</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Login;