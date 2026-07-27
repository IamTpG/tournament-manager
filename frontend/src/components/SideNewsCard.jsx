import "./SideNewsCard.css";

const SideNewsCard = ({ image, title, description, link }) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="side-card">
      {title}
    </a>
  );
};

export default SideNewsCard;
