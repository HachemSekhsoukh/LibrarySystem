import "../CSS/components/NavBar.css";
import { Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from '../utils/api';
import { useTranslation } from "react-i18next";

function NavBar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    const data = await logoutUser();
    if (data) {
      // Redirect or show a message based on logout success
      navigate("/login"); // Redirect to login page after successful logout
    } else {
      console.log("Logout failed!");
    }
  };

  const navItems = [
    { label: t("dashboard"), path: "/dashboard", icon: "/assets/images/home-icon.png" },
    { label: t("administration"), path: "/administration", icon: "/assets/images/home-icon.png" },
    { label: t("logs"), path: "/logs", icon: "/assets/images/home-icon.png" },
    {
      label: t("circulation"),
      subItems: [
        { label: t("readers"), path: "/circulation/readers", icon: "/assets/images/home-icon.png" },
        { label: t("exemplaires"), path: "/circulation/exemplaires", icon: "/assets/images/home-icon.png" },
        { label: t("late"), path: "/circulation/late", icon: "/assets/images/home-icon.png" },
        { label: t("administration"), path: "/circulation/administration", icon: "/assets/images/home-icon.png" },
      ],
    },
    {
      label: t("catalogage"),
      subItems: [
        { label: t("catalogage"), path: "/catalogage/catalogage", icon: "/assets/images/home-icon.png" },
        { label: t("administration"), path: "/catalogage/administration", icon: "/assets/images/home-icon.png" },
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
        {navItems.map((item, index) =>
          item.subItems ? (
            <div key={index} className="navSection">
              <span className="navSectionTitle">{t(item.label)} :</span>
              {item.subItems.map((subItem, subIndex) => (
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
          ) : (
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
