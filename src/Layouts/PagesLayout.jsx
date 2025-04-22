import NavBar from "../components/NavBar";
import Header from "../components/Header";
import "./PagesLayout.css";
import { Outlet, useLocation  } from "react-router-dom";
import React, { useEffect, useState } from 'react';

function PagesLayout() {
  const location = useLocation();

  // Define titles and subtitles for each route
  const pageTitles = {
    "/settings": { title: "settings", subtitle: "manage_your_preferences" },
    "/dashboard": { title: "dashboard", subtitle: "dashboard" },
    "/administration": { title: "administration", subtitle: "administration" },
    "/circulation/readers": { title: "circulation", subtitle: "readers" },
    "/circulation/exemplaires": { title: "circulation", subtitle: "exemplaires" },
    "/circulation/peb": { title: "circulation", subtitle: "PEB" },
    "/circulation/administration": { title: "circulation", subtitle: "administration" },
    "/catalogage/catalogage": { title: "catalogage", subtitle: "catalogage" },
    "/catalogage/administration": { title: "catalogage", subtitle: "administration" },
  };
  

  // Get the title and subtitle based on the current route
  const { title, subtitle } = pageTitles[location.pathname] || {
    title: "Page Not Found",
    subtitle: "The page you are looking for does not exist.",
  };

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

  return (
    <div className="pageLayoutContainer">
      <div className="header">
        <Header title={title} subtitle={subtitle} />
      </div>
      <div className="navbar">
        <NavBar />
      </div>
      <div className="spacer"></div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default PagesLayout;
