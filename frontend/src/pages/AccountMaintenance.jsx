import { useState, useEffect, useRef } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import validator from "validator";
import useAuth, { checkIfSignedIn, getToken } from "../hooks/auth";
import NoPage from "./NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";
const backendPhotos = backend.trim() + "/images/profilepictures";

const AccountMaintenance = () => {
  //hooks
  let { isSignedIn, registerUser, registrationError } = useAuth();
  const token = `Bearer ${getToken()}`;
  const location = useLocation();
  const routeParams = useParams();
  const inputFile = useRef();
  const [action, handleAction] = useState({
    type: "Register",
    title: "REGISTER",
  });
  const [currValues, setCurrentValues] = useState({
    userName: "",
    password: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });
  const [imageChanged, setImageChanged] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [oldValues, setOldValues] = useState(null);
  const [formError, setFormError] = useState(false);
  const [formErrorArray, setFormErrorArray] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = location.pathname.substring(1, 4).toLowerCase();
    if (url === "reg") {
      handleAction({
        type: "Register",
        title: "REGISTER",
        button1: "Create Account",
        button2: "Login",
      });
      setIsLoading(false);
    } else {
      handleAction({
        type: "Update",
        title: "UPDATE ACCOUNT",
        button1: "Update Account",
        button2: "Cancel",
        protect: true,
      });
      fetch(`${backend}/getaccountdetails`, {
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
            setFormError(true);
            setFormErrorArray(data.errMsg);
            if (data.errField !== "") {
              document.getElementById(data.errField).focus();
            }
          } else if (data.requestStatus === "ACTC") {
            setCurrentValues({
              userName: data.details.userName,
              password: "**********",
              email: data.details.email,
              phoneNumber: data.details.phoneNumber
                ? data.details.phoneNumber
                : "",
              firstName: data.details.firstName,
              lastName: data.details.lastName,
            });
            let imageFound = false;
            fetch(`${backendPhotos}/${data.details.userId}.jpeg`).then(
              (res) => {
                if (res.ok) {
                  setImageURL(`${backendPhotos}/${data.details.userId}.jpeg`);
                  imageFound = true;
                  setSelectedImage("x");
                }
                setOldValues({
                  userName: data.details.userName,
                  phoneNumber: data.details.phoneNumber
                    ? data.details.phoneNumber
                    : "",
                  firstName: data.details.firstName,
                  lastName: data.details.lastName,
                  image: imageFound ? "x" : null,
                });
              },
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, [location.pathname]);

  const checkIfUserIsSignedIn = () => {
    let user = checkIfSignedIn();
    if (!user.isSignedIn && action.type === "Update") {
      navigate("/"); //JAM Changed from /signin to avoid guests being routed to signin page
    } else if (user.isSignedIn && action.type === "Register") {
      navigate("/");
    }
  };

  const handlePhotoChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedImage(event.target.files[0]);
      setCurrentValues({ ...currValues, image: event.target.files[0] });
      setImageURL(URL.createObjectURL(event.target.files[0]));
      setImageChanged(true);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setCurrentValues({ ...currValues, image: null });
    setImageURL(null);
    setImageChanged(true);
  };

  const handleUploadClick = (e) => {
    inputFile.current.click();
  };

  const handleAccountDetails = (e) => {
    const field = e.target.name;
    const fieldValue = e.target.value;
    setCurrentValues({ ...currValues, [field]: fieldValue });
  };

  const navigate = useNavigate();
  const navigateCreateUpdate = (e) => {
    e.preventDefault();
    setFormError(false);
    if (!validator.isEmail(currValues.email)) {
      setFormError(true);
      setFormErrorArray([]);

      setFormErrorArray("Enter a valid email");
      return;
    }
    setFormError(false);
    setFormErrorArray("");
    if (action.type === "Register") {
      setIsLoading(true);
      registerUser(currValues, navigate);
      setIsLoading(false);
    } else {
      if (
        oldValues.userName == currValues.userName &&
        oldValues.phoneNumber == currValues.phoneNumber &&
        oldValues.firstName == currValues.firstName &&
        oldValues.lastName == currValues.lastName &&
        oldValues.image == selectedImage &&
        imageChanged == false
      ) {
        alert("NO CHANGES FOUND!");
      } else {
        setIsLoading(true);
        let data = { ...currValues, imageChanged: imageChanged };
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          Array.isArray(data[key])
            ? data[key].forEach((value) => formData.append(key + "[]", value))
            : formData.append(key, data[key]);
        });
        fetch(`${backend}/updateaccount`, {
          method: "POST",
          credentials: "include",
          body: formData,
          headers: {
            Authorization: token,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.requestStatus === "RJCT") {
              setFormError(true);
              setFormErrorArray(data.errMsg);
              if (data.errField !== "") {
                document.getElementById(data.errField).focus();
              }
            } else {
              navigate("/myprofile");
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
      }
    }
  };
  const navigateSigninOrCancel = () => {
    if (action.type === "Register") {
      navigate("/signin");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="d-flex container mt-5 justify-content-center">
      <Card style={{ width: "100%", padding: 20 }}>
        {!isSignedIn && action.type === "Update" && (
          <div>
            <NoPage />
          </div>
        )}
        {isSignedIn && action.type === "Register" && (
          <div>{checkIfUserIsSignedIn()}</div>
        )}
        {isLoading ? (
          <div className="loading-overlay">
            <div style={{ color: "black" }}>Loading...</div>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <h2 className="mb-4 center-text">{action.title}</h2>
            {formError && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {formErrorArray}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                ></button>
              </div>
            )}
            {registrationError && registrationError !== "" && (
              <div className="alert alert-danger mb-3 p-1">
                <p className="mb-0">{registrationError}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                navigateCreateUpdate(e);
              }}
              encType="multipart/form-data"
            >
              <div className="row">
                <div className="col mb-3">
                  <div className="row ">
                    <div className="col mb-3">
                      <label htmlFor="userName" className="form-label">
                        Username*
                      </label>
                      <input
                        id="userName"
                        name="userName"
                        type="text"
                        className="form-control"
                        value={currValues.userName}
                        onChange={handleAccountDetails}
                        required
                      />
                    </div>
                    <div className="col mb-3">
                      <label htmlFor="password" className="form-label">
                        Password*
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-control"
                        value={currValues.password}
                        onChange={handleAccountDetails}
                        disabled={action.protect}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <label htmlFor="email" className="form-label">
                        Email*
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-control"
                        value={currValues.email}
                        onChange={handleAccountDetails}
                        disabled={action.protect}
                        required={true}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name*
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="form-control"
                        value={currValues.firstName}
                        onChange={handleAccountDetails}
                        required
                      />
                    </div>
                    <div className="col mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name*
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className="form-control"
                        value={currValues.lastName}
                        onChange={handleAccountDetails}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <label htmlFor="phoneNumber" className="form-label">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        className="form-control"
                        value={currValues.phoneNumber}
                        onChange={handleAccountDetails}
                      />
                    </div>
                  </div>
                </div>
                <div className="col mb-3 text-center ">
                  <label htmlFor="upload" className="form-label ">
                    Profile Picture
                  </label>
                  {selectedImage && (
                    <div>
                      
                        <img
                          src={imageURL}
                          alt="profile picture"
                          className="rounded mw-100 mb-2 border border-secondary"
                          style={{ width: "20em", height: "20em" }}
                        />
                      
                        <button
                          onClick={() => handleImageRemove()}
                          className="btn btn-secondary m-3 btn-sm"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary m-3 btn-sm"
                          onClick={(e) => handleUploadClick(e)}
                        >
                          Replace
                        </button>
                      
                    </div>
                  )}
                  {!selectedImage && (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="rounded mw-100 mb-3 border border-secondary"
                        style={{ width: "20em", height: "20em" }}
                        viewBox="0 0 16 16"
                      >
                        <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5z" />
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                      <button
                        type="button"
                        className="btn btn-secondary mb-3 btn-sm"
                        onClick={(e) => handleUploadClick(e)}
                      >
                        Upload
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    id="upload"
                    name="upload"
                    value={""}
                    className="d-none"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    ref={inputFile}
                  />
                </div>
              </div>
              <div className="row justify-content-center">
                <button className="btn btn-dark col-3 mx-5" type="submit">
                  {action.button1}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary col-3"
                  onClick={navigateSigninOrCancel}
                >
                  {action.button2}
                </button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};
export default AccountMaintenance;
