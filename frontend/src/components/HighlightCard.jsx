import "./TournamentCard.css"; // just reuse
import BaseCard from "./BaseCard";

const HighlightCard = ({ image, title, description, URL }) => (
  <a
    href={URL}
    target="_blank"
    rel="noopener noreferrer"
    className="no-decoration"
  >
    <BaseCard image={image} title={title} description={description} />
  </a>
);

export default HighlightCard;
