import "../CSS/header.css";
const Header = () => {
  return (
    <header className="header">
      <div className="spacer"></div>
      <div className="rest">
        <div className="header-title">
          ENSIA / <span className="sub-title">Dashboard</span><br></br>
          <span className="sub-sub-title">Dashboard</span>
        </div>
          
        <img src="/assets/images/settings-icon.png" className="settings-icon"></img>
      </div>
  </header>
  );
};

export default Header;