import "../CSS/NavBar.css";
import { Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token or user data
    navigate("/login"); // Redirect to login
  };

  const navItems = [
      { label: "Dashboard", path: "/dashboard" , icon: "/assets/images/home-icon.png"},
      {
        label: "Circulation",
        subItems: [
          { label: "Readers", path: "/circulation/readers", icon: "/assets/images/home-icon.png" },
          { label: "Exemplaires", path: "/circulation/exemplaires", icon: "/assets/images/home-icon.png" },
          { label: "PEB", path: "/circulation/peb", icon: "/assets/images/home-icon.png" },
          { label: "Administration", path: "/circulation/admin", icon: "/assets/images/home-icon.png" },
        ],
      },
      {
        label: "Catalogage",
        subItems: [
          { label: "Catalogage", path: "/catalogage/catalogage", icon: "/assets/images/home-icon.png" },
          { label: "Administration", path: "/catalogage/admin", icon: "/assets/images/home-icon.png" },
        ],
      },
      {
        label: "Administration",
        subItems: [{ label: "Administration", path: "/administration/admin", icon: "/assets/images/home-icon.png" }],
      },
  ];
  

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
        {navItems.map((item, index) =>
          item.subItems ? (
            <div key={index} className="navSection">
              {/* <div className="icon-box">
                    <img src={subItem.icon} alt={subItem.label} className="navIcon" />
              </div> */}
              <span className="navSectionTitle">{item.label} :</span>
              {item.subItems.map((subItem, subIndex) => (
                <NavLink
                  key={subIndex}
                  to={subItem.path}
                  className={({ isActive }) =>
                    isActive ? "navItemActive" : "navItem"
                  }
                >
                  <div className="icon-box">
                    <img src={subItem.icon} alt={subItem.label} className="navIcon" />
                  </div>
                  <span>{subItem.label}</span>
                </NavLink>
              ))}
            </div>
          ) : (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "navItemActive" : "navItem"
              }
            >
            <div className="icon-box">
                    <img src={item.icon} alt={item.label} className="navIcon" />
            </div>
              <span>{item.label}</span>
            </NavLink>
          )
        )}
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
