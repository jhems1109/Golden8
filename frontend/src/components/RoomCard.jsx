import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import LiveCard from "./LiveCard";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import { format } from "date-fns";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";
const backendLogos = backend.trim() + "/images/logos";

const RoomCard = ({
  roomId,
  roomName,
  shortDesc,
  description,
  basePrice,
  maxPax,
  expanded,
  onClick,
}) => {
  const statusIcon = () => (
    <>
      {
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            border: "1px solid rgba(0, 0, 0, 0.5)",
            backgroundColor: "#7a7a7a",
            margin: 12,
          }}
        ></div>
      }
    </>
  );

  const [open, setOpen] = useState(expanded);

  const doesImageExist = (url) => {
    const img = new Image();
    img.src = url;
    return img.complete || img.width + img.height > 0;
  };

  const navigate = useNavigate();
  return (
    <div>
      <hr />
      <div className="d-flex justify-content-between px-5 py-2">
        <div
          className="d-flex align-items-center fw-bold fs-3 outlined-text"
          onClick={onClick}
          style={{ cursor: "pointer"}}
        >
          {statusIcon()}
          {`${roomName}`}
        </div>
        <div>
          <button
            type="button"
            className="btn"
            onClick={() => setOpen(!open)}
            aria-controls={`room-card`}
            aria-expanded={expanded}
          >
            {open ? (
              <i className="bi bi-caret-up-fill p-2 fs-5 bg-light" ></i>
            ) : (
              <i className="bi bi-caret-down-fill p-2 fs-5 bg-light"></i>
            )}
          </button>
        </div>
      </div>
      <div>
        <Collapse in={open}>
          <div id={`room-card`} className="card m-3">
            <Row>
              <div className="card-body d-flex flex-row overflow-auto">
                <Col className="col-3">
                  <div className="d-flex">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1rem",
                        paddingLeft: "2rem"
                      }}
                    >
                      <div>
                       
                        <Image
                          src={`${backendLogos}/${roomName}.jpeg`}
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = `/images/default logo.jpeg`;
                          }}
                          alt={`${roomName}`}
                          style={{ width: "10rem", height: "10rem" }}
                          className="room-details-pics-listing"
                          onClick={onClick}
                        />
                        
                      </div>
                    </div>
                  </div>
                </Col>
                <Col  className="col-9 fs-4">
                  <div className="room-details px-5 fw-bold">
                    <div className="fw-light">
                      <p className="p-0 m-0" style={{ marginTop: "10%" }}>
                        {description}
                      </p>
                    </div>
                    <br></br>
                    <div className="fw-light">
                      <p className="p-0 m-0">Base Price : {basePrice}</p>
                    </div>
                    <div className="fw-light">
                      <p className="p-0 m-0">
                        Maximum number of people included in base price :{" "}
                        {maxPax}
                      </p>
                    </div>
                  </div>
                </Col>
              </div>
            </Row>
          </div>
        </Collapse>
      </div>
    </div>
  );
};

RoomCard.propTypes = {
  roomName: PropTypes.string,
  shortDesc: PropTypes.string,
  description: PropTypes.string,
  basePrice: PropTypes.string,
  maxPax: PropTypes.number,
  expanded: PropTypes.bool,
  onClick: PropTypes.func,
};

export default RoomCard;
