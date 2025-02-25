import NavBar from "./NavBar";
import "./PagesLayout.css";
import { Outlet } from "react-router-dom";

function PagesLayout() {
  return (
    <div className="pageLayoutContainer">
      <div className="navbar">
        <NavBar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default PagesLayout;
