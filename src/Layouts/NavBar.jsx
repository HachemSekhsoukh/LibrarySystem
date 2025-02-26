import "./NavBar.css";
import { Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token or user data
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="navBarContainer">
      {/* Logo and Title */}
      <div className="titleLogo" onClick={() => navigate("/")}>
        <img src="/assets/images/logo.png" alt="logo" className="logo"/>
      </div>

      {/* Divider Line */}
      <div className="line"></div>

      {/* Navigation Items */}
      <nav className="navItems">
       
        {/* <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "navItemActive" : "navItem")}
        >
          Settings
        </NavLink> */}
      </nav>

      {/* Bottom Settings and Logout */}
      <div className="bottomNav">
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="logoutButton">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
