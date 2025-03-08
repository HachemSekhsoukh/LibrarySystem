import React from 'react';
import "../CSS/button.css";

function Button({ onClick, label, lightBackgrnd, icon, size = "medium" }) {
  // Size classes for different button sizes
  const sizeClasses = {
    small: "button-small",
    medium: "button-medium",
    large: "button-large"
  };

  return (
    <button
      className={`button ${sizeClasses[size]}`}
      onClick={onClick}
      style={{ backgroundColor: lightBackgrnd ? "#084c74cc" : "#063754"}}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-label">{label}</span>
    </button>
  );
}

export default Button;
