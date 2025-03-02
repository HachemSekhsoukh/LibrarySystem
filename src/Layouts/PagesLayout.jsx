import NavBar from "../components/NavBar";
import Header from "../components/Header";
import "./PagesLayout.css";
import { Outlet, useLocation  } from "react-router-dom";

function PagesLayout() {
  const location = useLocation();

  // Define titles and subtitles for each route
  const pageTitles = {
    "/settings": { title: "Settings", subtitle: "Manage your preferences" },
    "/dashboard": { title: "Dashboard", subtitle: "Dashboard" },
    "/administration": { title: "Administration", subtitle: "Administration" },
    "/circulation/readers": { title: "Circulation", subtitle: "Readers" },
    "/circulation/exemplaires": { title: "Circulation", subtitle: "Exemplaires" },
    "/circulation/peb": { title: "Circulation", subtitle: "PEB" },
    "/circulation/administration": { title: "Circulation", subtitle: "Administration" },
    "/catalogage/catalogage": { title: "Catalogage", subtitle: "Catalogage" },
    "/catalogage/administration": { title: "Catalogage", subtitle: "Administration" },
  };
  

  // Get the title and subtitle based on the current route
  const { title, subtitle } = pageTitles[location.pathname] || {
    title: "Page Not Found",
    subtitle: "The page you are looking for does not exist.",
  };

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
