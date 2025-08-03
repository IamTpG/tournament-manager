import BaseCard from "./BaseCard";

const HighlightCard = ({ image, title, description, URL }) => (
  <a
    href={URL}
    target="_blank"
    rel="noopener noreferrer"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <BaseCard image={image} title={title} description={description} />
  </a>
);

export default HighlightCard;
