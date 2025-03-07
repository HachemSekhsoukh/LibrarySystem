import React from 'react';
import "../CSS/button.css";

function Button({ onClick, label, lightBackgrnd }) {
  return (
    <button
      className="button"
      onClick={onClick}
      style={{ backgroundColor: lightBackgrnd ? "#084c74cc" : "#063754"}}
    >
      {label}
    </button>
  );
}


export default Button;
