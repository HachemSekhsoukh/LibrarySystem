import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/CSS/login.css";
import logo from "/assets/images/logo.png";
import bgLogin from "../../public/assets/images/bg-login.png";
import { loginUser } from  '../utils/api';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
  
    const newErrors = {};
  
    // Basic validation
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true); // Start loading
    try {
      // Attempt to login with the email and password
      const data = await loginUser(email, password);
  
      // Check if login was successful
      if (data && data.success) {
        // The JWT token is automatically handled by the HTTP-only cookie,
        navigate("/dashboard");
      } else {
        // Display error message returned from backend
        setErrors({ password: data?.error || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ password: "Something went wrong. Please try again." });
    } finally {
      setLoading(false); // Stop loading
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
        <div
          className="top-section"
          style={{ backgroundImage: `url(${bgLogin})` }}
        >
          <div className="logo">
            <img src={logo} alt="الوكالة الوطنية للمقاول الذاتي" />
          </div>

          <div className="welcome-text">
            <h1 className="welcome">Welcome!</h1>
            <h2>This is ENSIA Library Management System</h2>
          </div>
        </div>

        <div className="bottom-section">
          <div className="login-card">
            <h2>Sign in</h2>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="error-message">{errors.email}</p>
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
                © 2025, Made with ❤️ by Dr. Djouamaa Team
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
    </>
  );
};

export default Login;
