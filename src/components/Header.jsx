import "../CSS/components/header.css";
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import React, { useEffect, useState } from 'react';

const languageOptions = [
  { value: 'en', label: 'English', countryCode: 'US' },
  { value: 'fr', label: 'Français', countryCode: 'FR' }
];

const Header = ({ title, subtitle }) => {
  const { t,  i18n } = useTranslation();

   const customStyles = {
      control: (base) => ({
        ...base,
        backgroundColor: 'var(--input-background)',
        borderColor: 'var(--border-color)',
        minHeight: '40px',
      }),
      option: (styles, { isFocused }) => ({
        ...styles,
        backgroundColor: isFocused ? 'var(--hover-background)' : 'var(--background-color)',
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }),
      singleValue: (styles) => ({
        ...styles,
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: 'var(--background-color)',
        border: '1px solid var(--border-color)'
      }),
      input: (base) => ({
        ...base,
        color: 'var(--text-color)'
      })
    };
  
    const formatOptionLabel = ({ label, countryCode }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{ width: '24px', height: '16px' }}
        />
        {label}
      </div>
    );
  
    const [selectedLanguage, setSelectedLanguage] = useState(
      languageOptions.find(opt => opt.value === i18n.language)
    );

  return (
    <header className="header">
      <div className="spacer"></div>
      <div className="rest">
        <div className="header-title">
          ENSIA / <span className="sub-title">{t(title)}</span><br></br>
          <span className="sub-sub-title">{t(subtitle)}</span>
        </div>
        <div className="language-selector">
                    {/* <label>{t("language")}:</label> */}
                        <ReactSelect
                            options={languageOptions}
                            value={selectedLanguage}
                            onChange={(selected) => {
                              i18n.changeLanguage(selected.value);
                              setSelectedLanguage(selected);
                            }}
                            formatOptionLabel={formatOptionLabel}
                            styles={customStyles}
                            isSearchable={false}
                            components={{
                              IndicatorSeparator: () => null
                            }}
                            menuPortalTarget={document.body} // Add this line
                          />
                </div>
        <img src="/assets/images/settings-icon.png" className="settings-icon"></img>
      </div>
  </header>
  );
};

export default Header;