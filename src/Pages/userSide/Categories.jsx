import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/LibraryHome.css';
import NavHeader from '../../components/NavHeader';

const Categories = () => {
  const categories = [
    { id: 1, name: 'Technology', count: 150, icon: '💻' },
    { id: 2, name: 'Mathematics', count: 120, icon: '📐' },
    { id: 3, name: 'Science', count: 180, icon: '🔬' },
    { id: 4, name: 'Literature', count: 200, icon: '📚' },
    { id: 5, name: 'History', count: 160, icon: '⏳' },
    { id: 6, name: 'Art', count: 90, icon: '🎨' },
    { id: 7, name: 'Business', count: 110, icon: '💼' },
    { id: 8, name: 'Philosophy', count: 80, icon: '🤔' },
  ];

  return (
    <div className="library-home">
      <NavHeader />
      <div className="page-content">
        <div className="back-button" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back
        </div>

        <div className="page-title-container">
          <h1 className="page-title">Book Categories</h1>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              to={`/category/${category.id}`} 
              key={category.id} 
              className="category-card"
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.count} books</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories; 