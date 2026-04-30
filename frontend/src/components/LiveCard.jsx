import PropTypes from "prop-types";
import {format} from 'date-fns'; 

const backend = import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://panicky-robe-mite.cyclic.app';
const backendPhotos = 'https://golden8.netlify.app/';

const LiveCard = ({ match, onClickTeamIcon }) => {
  const formattedMatchDate = match.dateOfMatch
    ? format(new Date(match.dateOfMatch), 'yyyy-MM-dd')
    : 'TBD';
  const timeOfMatch = match.dateOfMatch
    ? format(new Date(match.dateOfMatch), 'HH:mm')
    : '';
  
  const doesImageExist = (url) => {
    const img = new Image();
    img.src = url;
    return img.complete || (img.width + img.height) > 0;
  };
  
  return (
    <div className="card card-body m-2" >
      <div className="d-flex justify-content-between">
        <div
          style={{ width: 80, height: 80, borderRadius: 40, marginRight: 20 }}
          onClick={onClickTeamIcon}
        >
          <img
            src={
              doesImageExist(`${backendPhotos}/teamlogos/${match.team1.teamId}.jpeg`)
                ? `${backendPhotos}/teamlogos/${match.team1.teamId}.jpeg`
                : `${backendPhotos}/teamlogos/default-image.jpeg`
            }
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            alt=""
          />
        </div>
        <div className="d-flex align-items-center">
          <p>vs</p>
        </div>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginLeft: 20,
          }}
          onClick={onClickTeamIcon}
        >
          <img
            src={
              doesImageExist(`${backendPhotos}/teamlogos/${match.team2.teamId}.jpeg`)
                ? `${backendPhotos}/teamlogos/${match.team2.teamId}.jpeg`
                : `${backendPhotos}/teamlogos/default-image.jpeg`
            }
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              borderRadius: 40,
            }}
            alt=""
          />
        </div>
      </div>
      <div>
        <hr />
      </div>
      <div className="d-flex p-0 m-0 justify-content-center">
        <p className="p-0 m-0" style={{width: '100px'}}>{formattedMatchDate}</p>
        <div
          style={{
            width: 1,
            marginRight:'55px',
            backgroundColor: "#666869",
          }}
        ></div>
        <p className="p-0 m-0">{timeOfMatch}</p>
      </div>
    </div>
  );
};

LiveCard.propTypes = {
  match: PropTypes.shape({
    dateOfMatch: PropTypes.string,
    locationOfMatch: PropTypes.string,
    team1: PropTypes.shape({
      teamId: PropTypes.string,
    }),
    team2: PropTypes.shape({
      teamId: PropTypes.string,
    }),
  }),
  onClickTeamIcon: PropTypes.func,
};

export default LiveCard;
