import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Stack } from "react-bootstrap";
import FlippableCard from "../components/card/FlippableCard";
import ListGroup from "react-bootstrap/ListGroup";
import { BsGearFill } from "react-icons/bs";
import useAuth, { checkIfSignedIn, getToken } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import NoPage from "./NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";
const backendPhotos = backend.trim() + "/images/profilepictures";

const Profile = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const token = `Bearer ${getToken()}`;
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState([]);
  const [userInfo, setUserInfo] = useState({
    userId: null,
    userName: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });

  const checkIfUserIsSignedIn = () => {
    let user = checkIfSignedIn();
    if (!user.isSignedIn) {
      navigate("/"); //JAM Changed from /signin
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${backend}/myprofile`, {
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
          setUserInfo({
            userId: data.details.userId,
            userName: data.details.userName,
            email: data.details.email,
            phoneNumber: data.details.phoneNumber
              ? data.details.phoneNumber
              : "",
            firstName: data.details.firstName,
            lastName: data.details.lastName,
            imageURL: data.details.imageURL ? data.details.imageURL : "",
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  }, []);

  return (
    <>
      {!isSignedIn && <div>{checkIfUserIsSignedIn()}</div>}
      <Container className="mt-5">
        <Row className="gutters-sm">
          <Col className="justify-content-center">
            <Card>
              <Card.Body>
                <div className="d-flex flex-column align-items-center text-center">
                  <img
                    src={`${userInfo.imageURL}`}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = `/images/default profile.png`;
                    }}
                    className="rounded-circle"
                    width="150"
                  />
                  <br></br>
                  <div className="mt-9">
                    <h4>{userInfo.userName}</h4>
                    <h4>{userInfo.email}</h4>
                    <p>{userInfo.firstName}</p>
                    <p>{userInfo.lastName}</p>
                    <p className="text-secondary mb-1">{userInfo.phoneNumber}</p>
                    <a
                      href="/updateaccount"
                      className="btn btn-outline-dark"
                    >
                      <BsGearFill className="m-auto" style={{ width: "2rem", height: "2rem"}}/>
                    </a>{" "}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
