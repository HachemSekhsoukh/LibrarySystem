import "../CSS/components/header.css";
import { useTranslation } from 'react-i18next';
const Header = ({ title, subtitle }) => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="spacer"></div>
      <div className="rest">
        <div className="header-title">
          ENSIA / <span className="sub-title">{t(title)}</span><br></br>
          <span className="sub-sub-title">{t(subtitle)}</span>
        </div>
          
        <img src="/assets/images/settings-icon.png" className="settings-icon"></img>
      </div>
  </header>
  );
};

export default Header;