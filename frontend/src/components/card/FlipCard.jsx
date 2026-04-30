import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BsQuestionCircle } from 'react-icons/bs'; 
import './flipCard.css';
import './flipTransition.css';

const backend = import.meta.env.MODE === "development" ? "http://localhost:8000" : "https://golden8.onrender.com";

const FlipCard = ({ onClick, imageUrl, cardText, shortDesc, roomId }) => {
  const handleImageError = (event) => {
    event.target.style.display = 'none'; // Hide the image
  };

  return (
    <div className="card-wrapper" onClick={onClick}>
      <div className="card-back">
        <div className="scrollable-container">
          <div>{shortDesc}</div>
        </div>
      </div>

      <div
        className="card-front"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' }}
      >
        <Link className="card-text" to={`/room/${roomId}`}>
          {cardText}
        </Link>
        <div className="overlay">Click to flip!</div>
      </div>
    </div>
  );
};

FlipCard.propTypes = {
  onClick: PropTypes.func,
  imageUrl: PropTypes.string,
  cardText: PropTypes.string,
  shortDesc: PropTypes.string,
  roomId: PropTypes.string,
};

export default FlipCard;
