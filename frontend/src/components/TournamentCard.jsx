import { Link, useNavigate } from 'react-router-dom';
import BaseCard from "./BaseCard";
import "./TournamentCard.css";

const TournamentCard = ({ id, image, game, title, format, description, participants, start_date, end_date, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/admin/tournament/${id}/edit`);
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/tournament/${id}/register`);
  };

  return (
    <Link to={`/tournament/${id}`} className="no-decoration">
      <BaseCard image={image} title={title} description={format}>
        <div className="card-footer">
          <div>
            <p>📅 {start_date}</p>
            <p>🎮 {participants} Participants</p>
          </div>
          {isLoggedIn ? (
            <button className="edit" onMouseDown={handleEditClick}>Chỉnh sửa</button>
          ) : (
            <button className="join" onMouseDown={handleJoinClick}>Tham gia</button>
          )}
        </div>
      </BaseCard>
    </Link>
  );
};

export default TournamentCard;