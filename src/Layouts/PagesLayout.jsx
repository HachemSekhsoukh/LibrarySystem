import NavBar from "../components/NavBar";
import Header from "../components/Header";
import "./PagesLayout.css";
import { Outlet } from "react-router-dom";

function PagesLayout() {
  return (
    <div className="pageLayoutContainer">
      <div className="header">
        <Header />
      </div>
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
