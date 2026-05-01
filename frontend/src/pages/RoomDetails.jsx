import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Card, Image, ListGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { BsGearFill } from "react-icons/bs";
import useAuth, { checkIfSignedIn, getToken } from "../hooks/auth";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";
const backendLogos = backend.trim() + "/images/logos";

const RoomDetails = () => {
  const navigate = useNavigate();
  const routeParams = useParams();
  const token = `Bearer ${getToken()}`;
  const { isSignedIn } = useAuth();
  const [isLoading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState([]);
  const [roomInfo, setRoomInfo] = useState({
    roomId: "",
    roomName: "",
    shortDesc: "",
    description: "",
    basePrice: "",
    maxPax: 1,
    dspPriority: 10,
    displayUpdateButton: null,
  });
  const [photos, setPhotos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 3;

  const navigateUpdate = () => {
    navigate(`/updateroom/${routeParams.roomid}`);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${backend}/room/${routeParams.roomid}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "Application/JSON",
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.requestStatus === "RJCT") {
          setErrorMessage([data.errMsg]);
          if (data.errField !== "") {
            document.getElementById(data.errField).focus();
          }
        } else {
          setRoomInfo({
            roomId: data.details.roomId,
            roomName: data.details.roomName,
            shortDesc: data.details.shortDesc,
            description: data.details.description,
            basePrice: data.details.basePrice,
            maxPax: data.details.maxPax,
            dspPriority: data.details.dspPriority,
            displayUpdateButton: true,
          });
          setPhotos(data.photos);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  }, []);

  const totalPages = Math.ceil(photos.length / photosPerPage);
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  const show = (index, photoIdx) => {
    const modal = document.getElementById("myModal");
    let img = document.getElementById(index);
    const modalImg = document.getElementById("img01");
    let captionText = document.getElementById("caption");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    let span = document.getElementsByClassName("close")[0];
    img.onclick = function () {
      modal.style.display = "block";
      modalImg.src = `${backend}/${photos[photoIdx].pathName}`;
      captionText.innerHTML = photos[photoIdx].imageDesc;
    };

    prev.onclick = function () {
      let slideIndex = photoIdx - 1;
      if (slideIndex < 0) {
        slideIndex = photos.length - 1;
      }
      modal.style.display = "block";
      modalImg.src = `${backend}/${photos[slideIndex].pathName}`;
      captionText.innerHTML = photos[slideIndex].imageDesc;
      show(index, slideIndex);
    };

    next.onclick = function () {
      let slideIndex = photoIdx + 1;
      if (slideIndex + 1 > photos.length) {
        slideIndex = 0;
      }
      modal.style.display = "block";
      modalImg.src = `${backend}/${photos[slideIndex].pathName}`;
      captionText.innerHTML = photos[slideIndex].imageDesc;
      show(index, slideIndex);
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    };
  };

  return (
    <>
      {isLoading ? (
        <div className="loading-overlay">
          <div>Loading ...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div
            className="d-flex w-100 position-absolute w-75 justify-content-end p-5"
            style={{ zIndex: "2" }}
          >
            {isSignedIn && roomInfo.displayUpdateButton === true && (
              <Button
                onClick={navigateUpdate}
                variant="transparent"
                className="trialbtn"
              >
                <BsGearFill
                  className="m-auto"
                  style={{ width: "2rem", height: "2rem" }}
                />
              </Button>
            )}
          </div>

          <div
            className="App"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "2rem",
            }}
          >
            <div className="bg-light container justify-content-center text-center">
              {/* Here is the team header, with background and info */}

              <div
                className="bg-image mt-2 d-flex p-5 text-center shadow-1-strong rounded mb-3 text-white"
                style={{
                  backgroundImage: "url('/images/default banner.jpeg')",
                  backgroundSize: "cover",
                 
                }}
              >
                <Container
                  style={{ "background-color": "rgba(0, 0, 0, 0.25)" }}
                  className="rounded"
                >
                  <Row className="text-center ms-3 mt-3">
                    <Image
                      src={`${backendLogos}/${roomInfo.roomName}.jpeg`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = `/images/default logo.jpeg`;
                      }}
                      className="border border-info shadow object-fit-cover "
                      roundedCircle
                      fluid
                      style={{ width: "10rem", height: "10rem" }}
                    />
                    <Col>
                      <h1 className="header-text-info">{roomInfo.roomName}</h1>
                      <p className="mt-5 information-text">
                        {roomInfo.description}
                      </p>
                      <p className="mt-5 information-text">
                        Base price : {roomInfo.basePrice}
                      </p>
                      <p className="information-text">
                        Maximum number of people included in base price :{" "}
                        {roomInfo.maxPax}
                      </p>
                    </Col>
                  </Row>
                  <Row className="text-start ms-5 mt-2"></Row>
                </Container>
              </div>

              {/* Here are the room photos */}
              <Row style={{ paddingTop: "5rem" }}>
                <Col className="border">
                  <div className="team-past-matches">
                    

                    <section>
                      <div className="container">
                        <div className="align-items-center border justify-content-center">
                          <Row className="gap-3 justify-content-center mb-2 ">
                            {currentPhotos.map((photo, index) => (
                              <Col
                                sm={3}
                                className="border mt-2 rounded passive-active-column"
                                key={index}
                              >
                                <Row className="align-items-center">
                                  <Col>
                                    <Image
                                      src={`${backend}/${photo.pathName}`}
                                      onError={({ currentTarget }) => {
                                        currentTarget.onerror = null; // prevents looping
                                        currentTarget.src = `/images/default logo.jpeg`;
                                      }}
                                      id={index}
                                      className="mySlides mt-2 mb-2 shadow object-fit-cover border"
                                      alt={photo.imageDesc}
                                      onClick={() =>
                                        show(
                                          index,
                                          (currentPage - 1) * photosPerPage +
                                            index,
                                        )
                                      }
                                      rounded
                                      fluid
                                    />
                                    <div id="myModal" className="modal">
                                      <div className="modal-content">
                                        <span className="close">&times;</span>
                                        <img id="img01"></img>
                                        <button id="prev">❮</button>
                                        <button id="next">❯</button>
                                        <p id="caption"></p>
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </Col>
                            ))}
                          </Row>
                        </div>

                        <div className="pagination">
                          <button
                            className={`pagination-button ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            <BiChevronLeft size={20} />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              className={`pagination-button ${
                                i + 1 === currentPage ? "active" : ""
                              }`}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            className={`pagination-button ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            <BiChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RoomDetails;
