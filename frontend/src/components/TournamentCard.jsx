import { Link, useNavigate } from 'react-router-dom';
import BaseCard from "./BaseCard";
import "./TournamentCard.css";

const TournamentCard = ({ _id, image, game, title, format, start_date, end_date, participants, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/admin/tournament/${_id}/edit`);
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Change to join route
    navigate(`/tournament/${_id}`);
  };

  return (
    <Link to={`/tournament/${_id}`} className="no-decoration">
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