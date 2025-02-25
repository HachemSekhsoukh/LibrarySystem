import { useState } from "react";
import "./Login.css";
import logo from "/assets/images/logo1.png";
import bgLogin from "../../../public/assets/images/bg-login.png";

const Login = () => {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset previous errors
    const newErrors = {};

    // Validate Name field
    if (!accountName.trim()) {
      newErrors.accountName = "Account Name is required";
    }

    // Validate Password field
    if (!password) {
      newErrors.password = "Password is required";
    }

    // If there are errors, update state and do not submit form
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If validation passes, you can perform further actions (e.g., call an API)
    console.log("Form submitted", { accountName, password });
    // Optionally, clear errors after successful submission
    setErrors({});
  };

  return (
    <div className="login-container">
      <div
        className="top-section"
        style={{ backgroundImage: `url(${bgLogin})` }}
      >
        <div className="logo">
          <img src={logo} alt="الوكالة الوطنية للمقاول الذاتي" />
        </div>

        <div className="welcome-text">
          <h1 className="welcome">Welcome!</h1>
          <h2>WAKALAT CHABAB W RIYADHA</h2>
        </div>
      </div>

      <div className="bottom-section">
        <div className="login-card">
          <h2>Sign in</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
              {errors.accountName && (
                <p className="error-message">{errors.accountName}</p>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            <button type="submit" className="signin-btn">
              Sign in
            </button>
          </form>
        </div>

        <footer>
          <div className="footer-content">
            <div className="footer-left">
              © 2025, Made with ❤️ by Wazir Team
            </div>
            <div className="footer-right">
              <a href="#">Contact us</a>
              <a href="#">Address</a>
              <a href="#">License</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
