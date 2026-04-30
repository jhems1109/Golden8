import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import "../App.css";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const Activities = () => {
  const [photos, setPhotos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const photosPerPage = 4;

  useEffect(() => {
    fetchPageDetails();
  }, []);

  const fetchPageDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backend}/activities`);
      const data = await response.json();
      setPhotos(data.details);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div>Loading top rooms...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          
            <div >
              <div className="align-items-center justify-content-center">
                <div className="d-flex justify-content-center w-100 pt-3">
                  <h1>WATER ACTIVITIES</h1>
                </div>
                <Row className="gap-3 justify-content-center mb-2 ">
                  {currentPhotos.map((photo, index) => (
                    <Col
                      sm={5}
                      className="border mt-2 rounded passive-active-column"
                      key={index}
                    >
                      <Row className="align-items-center">
                        <Col>
                          <Image
                            src={`${backend}/${photo.pathName}`}
                            id={index}
                            className="mt-2 mb-2 shadow object-fit-cover border"
                            alt={photo.imageDesc}
                            onClick={() =>
                              show(
                                index,
                                (currentPage - 1) * photosPerPage + index,
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
          
        </>
      )}
    </>
  );
};

export default Activities;
