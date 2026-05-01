import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import FlippableCard from "../components/card/FlippableCard";
import { Link } from "react-router-dom";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import "../App.css";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";
const backendLogos = backend.trim() + "/images/logos";
const backendPhotos = backend.trim() + "/images/home";

const Home = () => {
  const [topRooms, setTopRooms] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [opacity, setOpacity] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const photosPerPage = 3;

  useEffect(() => {
    setOpacity(1);
    fetchHome();
  }, []);

  const fetchHome = async () => {
    try {
      setIsLoadingRooms(true);
      const response = await fetch(`${backend}`);
      const data = await response.json();
      setTopRooms(data.details);
      setPhotos(data.photos);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow:
      topRooms.length == 1
        ? 1
        : topRooms.length == 2
        ? 2
        : topRooms.length == 3
        ? 3
        : topRooms.length == 4
        ? 4
        : 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    centerMode: true,
    centerPadding: "10px",
  };

  const sliderSettingsFourCards = {
    ...sliderSettings,
    slidesToShow:
      topRooms.length == 1
        ? 1
        : topRooms.length == 2
        ? 2
        : topRooms.length == 3
        ? 3
        : 4,
  };

  const sliderSettingsThreeCards = {
    ...sliderSettings,
    slidesToShow: topRooms.length == 1 ? 1 : topRooms.length == 2 ? 2 : 3,
  };

  const sliderSettingsTwoCards = {
    ...sliderSettings,
    slidesToShow: topRooms.length == 1 ? 1 : 2,
  };

  const sliderSettingsOneCard = {
    ...sliderSettings,
    slidesToShow: 1,
  };
  const [sliderSettingsToUse, setSliderSettingsToUse] =
    useState(sliderSettings);

  const updateSliderSettings = () => {
    if (window.innerWidth >= 1398) {
      setSliderSettingsToUse(sliderSettings);
    } else if (window.innerWidth >= 1126) {
      if (topRooms.length > 3) {
        setSliderSettingsToUse(sliderSettingsFourCards);
      } else {
        setSliderSettingsToUse(sliderSettings);
      }
    } else if (window.innerWidth >= 837) {
      if (topRooms.length > 2) {
        setSliderSettingsToUse(sliderSettingsThreeCards);
      } else {
        setSliderSettingsToUse(sliderSettings);
      }
    } else if (window.innerWidth >= 560) {
      if (topRooms.length > 1) {
        setSliderSettingsToUse(sliderSettingsTwoCards);
      } else {
        setSliderSettingsToUse(sliderSettings);
      }
    } else {
      setSliderSettingsToUse(sliderSettingsOneCard);
    }
  };

  useEffect(() => {
    updateSliderSettings();
    window.addEventListener("resize", updateSliderSettings);

    return () => {
      window.removeEventListener("resize", updateSliderSettings);
    };
  }, [topRooms.length]);

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
    const next = document.getElementById("next")
    let span = document.getElementsByClassName("close")[0];
    img.onclick = function () {
      modal.style.display = "block";
      modalImg.src = `${backend}/${photos[photoIdx].pathName}`;
      captionText.innerHTML = photos[photoIdx].imageDesc;
    };

    prev.onclick = function () {
      let slideIndex = photoIdx - 1
      if (slideIndex < 0) {slideIndex = photos.length - 1}
      modal.style.display = "block";
      modalImg.src = `${backend}/${photos[slideIndex].pathName}`;
      captionText.innerHTML = photos[slideIndex].imageDesc
      show(index, slideIndex)
    }

    next.onclick = function () {
      let slideIndex = photoIdx + 1
      if (slideIndex + 1 > photos.length) {slideIndex = 0}
      modal.style.display = "block";
      modalImg.src = `${backend}/${photos[slideIndex].pathName}`;
      captionText.innerHTML = photos[slideIndex].imageDesc
      show(index, slideIndex)
    }
    
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    };
  };

  return (
    <>
      {isLoadingRooms ? (
        <div className="loading-overlay">
          <div>Loading ...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="App" style={{ textAlign: "center" }}>
            <div
              style={{
                backgroundImage: "url('/images/homePagephoto.jpg')",
                backgroundSize: "cover",
                width: "100%",
              }}
            >
              <h1
                className="animated-text outlined-text"
                style={{
                  color: "white",
                  opacity: opacity,
                  transition: "opacity 5s",
                  paddingLeft: "40%",
                  paddingTop: "35%",
                  fontSize: "5vw",
                }}
              >
                Golden 8 Beach Resort, <br /> where fun starts
              </h1>
            </div>

            <div style={{ width: "100%", position: "relative" }}>
              <h1> </h1>

              <div
                className="slider-wrapper"
                style={{
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  paddingTop: "5%",
                }}
              >
                <Slider
                  key={sliderSettingsToUse.slidesToShow}
                  {...sliderSettingsToUse}
                >
                  {topRooms.map((room, index) => (
                    <div key={index}>
                      <FlippableCard
                        imageUrl={`${backendLogos}/${room.roomName}.jpeg`}
                        cardText={room.roomName}
                        shortDesc={room.shortDesc}
                        roomId={room.roomId}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </div>

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
                            onClick={() => show(index, (currentPage-1)*photosPerPage + index)}
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
        </>
      )}
    </>
  );
};

export default Home;
