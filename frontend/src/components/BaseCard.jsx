import "./BaseCard.css";

const BaseCard = ({ image, title, description, children }) => (
  <div className="card">
    <img src={image} alt={title} className="card-img" />
    <div className="card-content">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  </div>
);

export default BaseCard;
