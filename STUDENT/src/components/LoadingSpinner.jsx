import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = '#005198', show = true }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  if (!show) return null;

  return (
    <div className="spinner-container">
      <div 
        className={`spinner ${sizeClasses[size]}`}
        style={{ borderColor: `${color} transparent transparent transparent` }}
      />
    </div>
  );
};

export default LoadingSpinner; 