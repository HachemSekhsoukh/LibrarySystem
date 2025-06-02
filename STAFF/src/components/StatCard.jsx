import "../CSS/components/StatCard.css";

const StatCard = ({ image, title, subtitle, number }) => {
  return (
    <div className="stat-card">
      <div className="image-container">
        <img src={image} alt="icon" className="image" />
      </div>
      <h4 className="stat-card-title">{title}</h4>
      <p className="stat-card-subtitle">{subtitle}</p>
      <hr className="stat-card-divider" />
      <span className="stat-card-number">{number}</span>
    </div>
  );
};

export default StatCard;