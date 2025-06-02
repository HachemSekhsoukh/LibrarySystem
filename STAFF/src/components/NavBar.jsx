import "../CSS/components/NavBar.css";
import { Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from '../utils/api';
import { useTranslation } from "react-i18next";
import { useAuth } from "../utils/privilegeContext";

function NavBar() {
  const { hasPrivilege, setPrivileges} = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    const data = await logoutUser();
    if (data) {
      localStorage.removeItem("privileges");  // Clear from localStorage
      setPrivileges([]);                      // Clear from context state
      navigate("/login");                     // Redirect to login page
    } else {
      console.log("Logout failed!");
    }
  };

  const navItems = [
    { label: "dashboard", path: "/dashboard", icon: "/assets/images/home-icon.png" },
    { label: "administration", path: "/administration", icon: "/assets/images/home-icon.png" },
    { label: "logs", path: "/logs", icon: "/assets/images/home-icon.png" },
    {
      label: "circulation",
      subItems: [
        { label: "readers", path: "/circulation/readers", icon: "/assets/images/home-icon.png" },
        { label: "exemplaires", path: "/circulation/exemplaires", icon: "/assets/images/home-icon.png" },
        { label: "late", path: "/circulation/late", icon: "/assets/images/home-icon.png" },
        { label: "administration", path: "/circulation/administration", icon: "/assets/images/home-icon.png" },
      ],
    },
    {
      label: "catalogage",
      subItems: [
        { label: "catalogage", path: "/catalogage/catalogage", icon: "/assets/images/home-icon.png" },
        { label: "administration", path: "/catalogage/administration", icon: "/assets/images/home-icon.png" },
      ],
    },
  ];  
  

  return (
    <div className="navBarContainer">
      {/* Logo and Title */}
      <div className="titleLogo">
        <img src="/assets/images/logo.png" alt="logo" className="logo" />
      </div>

      {/* Divider Line */}
      <div className="divider-container">
        <hr className="nav-bar-divider" />
      </div>

      {/* Navigation Items */}
      <nav className="navItems">
        {navItems.map((item, index) => {
          if (item.subItems) {
            // Filter subItems based on privilege
            const visibleSubItems = item.subItems.filter(subItem => {
              const privKey = `view_${item.label.toLowerCase()}_${subItem.label.toLowerCase()}`;
              console.log(privKey, hasPrivilege(privKey));
              return hasPrivilege(privKey);
            });            

            // If none of the subitems are visible, skip rendering this section
            if (visibleSubItems.length === 0) return null;

            return (
              <div key={index} className="navSection">
                <span className="navSectionTitle">{t(item.label)} :</span>
                {visibleSubItems.map((subItem, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={subItem.path}
                    className={({ isActive }) => (isActive ? "navItemActive" : "navItem")}
                  >
                    <div className="icon-box-inactive">
                      <img src={subItem.icon} alt={subItem.label} className="navIcon" />
                    </div>
                    <span>{t(subItem.label)}</span>
                  </NavLink>
                ))}
              </div>
            );
          } else {
            const privKey = `view_${item.label.toLowerCase()}`;
            if (!hasPrivilege(privKey)) return null;
            
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => (isActive ? "navItemActive" : "navItem")}
              >
                <div className="icon-box-inactive">
                  <img src={item.icon} alt={item.label} className="navIcon" />
                </div>
                <span>{t(item.label)}</span>
              </NavLink>
            );
          }
        })}
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
          <span>{t("settings")}</span>
        </NavLink>
        <button onClick={handleLogout} className="logoutButton">
          <LogOut className="logout-icon" size={21} />
          <span>{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;