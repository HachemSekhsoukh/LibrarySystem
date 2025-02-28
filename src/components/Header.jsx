import "../CSS/header.css";
const Header = () => {
  return (
    <header className="header">
      <div className="spacer"></div>
      <div className="rest">
        <div className="header-title">
          ENSIA / <span className="sub-title">Settings</span><br></br>
          <span className="sub-sub-title">Settings</span>
        </div>
          
        <img src="/assets/images/settings-icon.png" className="settings-icon"></img>
      </div>
  </header>
  );
};

export default Header;