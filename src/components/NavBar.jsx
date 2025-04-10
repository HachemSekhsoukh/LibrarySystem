import "../CSS/components/NavBar.css";
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
      { label: "Administration", path: "/administration" , icon: "/assets/images/home-icon.png"},
      {
        label: "Circulation",
        subItems: [
          { label: "Readers", path: "/circulation/readers", icon: "/assets/images/home-icon.png" },
          { label: "Exemplaires", path: "/circulation/exemplaires", icon: "/assets/images/home-icon.png" },
          { label: "PEB", path: "/circulation/peb", icon: "/assets/images/home-icon.png" },
          { label: "Administration", path: "/circulation/administration", icon: "/assets/images/home-icon.png" },
        ],
      },
      {
        label: "Catalogage",
        subItems: [
          { label: "Catalogage", path: "/catalogage/catalogage", icon: "/assets/images/home-icon.png" },
          { label: "Administration", path: "/catalogage/administration", icon: "/assets/images/home-icon.png" },
        ],
      },
  ];
  

  return (
    <div className="navBarContainer">
      {/* Logo and Title */}
      <div className="titleLogo">
        <img src="/assets/images/logo.png" alt="logo" className="logo"/>
      </div>

      {/* Divider Line */}
      <div className="divider-container">
        <hr className="nav-bar-divider" />
      </div>
      

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
                  <div className="icon-box-inactive">
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
            <div className="icon-box-inactive">
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
          className={({ isActive }) => (isActive ? "navItemActive" : "navItem")}
        >
          <div className="icon-box-inactive">
            <Settings size={20} />
          </div>
          
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="logoutButton">
          <LogOut className="logout-icon" size={21} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
