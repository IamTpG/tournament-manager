import "./NewsCard.css";

const NewsCard = ({ image, title, content, link, published_day}) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="news-card">
      <img src={image} alt={title} className="news-card-img" />
      <div className="news-card-content">
        <h2>{title}</h2>
        <p>{content}</p>
        <span>Đọc thêm→</span>
        <div className="news-card-date">
          <small>📅 {published_day}</small>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
