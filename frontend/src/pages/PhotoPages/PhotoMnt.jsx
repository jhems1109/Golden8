import { useState, useEffect, useRef } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import { FaTrash, FaPlusCircle } from "react-icons/fa";
import { checkIfSignedIn, getToken } from "../../hooks/auth";
import NoPage from "../NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const PhotoMnt = () => {
  let { isSignedIn } = checkIfSignedIn();
  const token = `Bearer ${getToken()}`;
  const inputFile = useRef(null);
  const routeParams = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [action, handleAction] = useState("");
  const [currValues, setCurrentValues] = useState({
    imagePage: "",
    imageDesc: "",
    dspPriority: 99,
  });
  const [imageChanged, setImageChanged] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageName, setPageName] = useState("Home");

  useEffect(() => {
    setIsLoading(true);
    const url = window.location.pathname;
    if (url === "/photocreate") {
      setPageName(searchParams.get("pageName"));
      handleAction({
        type: "Creation",
        title: "CREATE PHOTO",
        button1: "Create",
      });
      setCurrentValues({
        ...currValues,
        imagePage: searchParams.get("pageName"),
      });
      setIsLoading(false);
    } else {
      handleAction({
        type: "Update",
        title: "UPDATE PHOTO",
        button1: "Update",
      });
      fetch(`${backend}/getphotodetails/${routeParams.photoid}`, {
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
          } else if (data.requestStatus === "ACTC") {
            let details = data.details;
            setCurrentValues({
              ...currValues,
              imagePage: details.imagePage,
              imageDesc: details.imageDesc,
              dspPriority: details.dspPriority,
              createdAt: details.createdAt,
              updatedAt: details.updatedAt,
            });
            fetch(`${backend}/${details.pathName}`).then((res) => {
              if (res.ok) {
                setImageURL(`${backend}/${details.pathName}`);
                setSelectedImage("x");
              }
            });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, [location.pathname]);

  const handlePhotoChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedImage(event.target.files[0]);
      setCurrentValues({ ...currValues, image: event.target.files[0] });
      setImageURL(URL.createObjectURL(event.target.files[0]));
      setImageChanged(true);
    }
  };

  const handlePhotoDetails = (e) => {
    const arrOfNumerics = ["dspPriority"];
    const field = e.target.name;
    if (arrOfNumerics.find((e) => e === field)) {
      setCurrentValues({ ...currValues, [field]: Number(e.target.value) });
    } else {
      setCurrentValues({ ...currValues, [field]: e.target.value.trim() });
    }
  };

  const navigate = useNavigate();

  const navigateCreateUpdate = () => {
    let error = false;
    error = validateInput();
    if (!error) {
      let data = { ...currValues, imageChanged: imageChanged };
      setIsLoading(true);
      if (action.type === "Creation") {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          Array.isArray(data[key])
            ? data[key].forEach((value) => formData.append(key + "[]", value))
            : formData.append(key, data[key]);
        });
        fetch(`${backend}/photocreate`, {
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
              setErrorMessage([data.errMsg]);
            } else {
              navigate(-1);
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
      } else {
        fetch(`${backend}/photoupdate/${routeParams.photoid}`, {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify(data),
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
              navigate(-1);
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

  const validateInput = () => {
    let errResp = false;
    let errMsgs = [];
    let focusON = false;
    if (
      (imageChanged === false || imageURL === null) &&
      action.type === "Creation"
    ) {
      errMsgs.push("Photo is required.");
      if (!focusON) {
        //document.getElementById("image").focus();
        focusON = true;
      }
    }
    if (currValues.dspPriority < 1) {
      errMsgs.push("Listing display priority is required.");
      if (!focusON) {
        document.getElementById("dspPriority").focus();
        focusON = true;
      }
    }
    setErrorMessage(errMsgs);
    if (errMsgs.length > 0) {
      errResp = true;
    }
    return errResp;
  };

  const navigateCancel = () => {
    navigate(-1);
  };

  return (
    <div className="d-flex container mt-2 justify-content-center">
      {!isSignedIn ? (
        <div>
          <NoPage />
        </div>
      ) : isLoading ? (
        <div className="loading-overlay">
          <div style={{ color: "black" }}>Loading...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <Card style={{ width: "70rem", padding: 20 }}>
          {errorMessage.length > 0 && (
            <div className="alert alert-danger mb-3 p-1">
              {errorMessage.map((err, index) => (
                <p className="mb-0" key={index}>
                  {err}
                </p>
              ))}
            </div>
          )}
          <h2 className="mb-4 center-text">{action.title}</h2>
          <form action="" encType="multipart/form-data">
            <div className="row ">
              <div className="col-6 mb-3">
                <label htmlFor="imagePage" className="form-label">
                  Image Page
                </label>
                <input
                  id="imagePage"
                  name="imagePage"
                  type="text"
                  className="form-control"
                  value={currValues.imagePage}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row">
              <div className="col mb-3">
                <label htmlFor="imageDesc" className="form-label">
                  Image Description
                </label>
              
                <input
                  id="imageDesc"
                  name="imageDesc"
                  type="text"
                  className="form-control"
                  value={currValues.imageDesc}
                  onChange={handlePhotoDetails}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3 mb-3">
                <label htmlFor="dspPriority" className="form-label">
                  Display Priority*
                </label>
                <input
                  id="dspPriority"
                  name="dspPriority"
                  type="number"
                  min="1"
                  className="form-control"
                  value={currValues.dspPriority}
                  onChange={handlePhotoDetails}
                  required
                />
              </div>
            </div>
            <div className="row justify-content-center mt-3">
              <div className="col mb-3 text-center">
                <label htmlFor="upload" className="form-label ">
                  Image
                </label>
                {selectedImage && (
                  <div>
                    <img
                      src={imageURL}
                      id="image"
                      alt="profile picture"
                      className="rounded mw-100 mb-2 border border-secondary"
                      style={{ width: "100rem", height: "13rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary mb-3 btn-sm"
                      onClick={() => inputFile.current.click()}
                      disabled={action.type === "Creation" ? false : true}
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
                      onClick={() => inputFile.current.click()}
                    >
                      Upload
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  id="upload"
                  name="upload"
                  className="d-none"
                  onChange={handlePhotoChange}
                  accept="image/*"
                  ref={inputFile}
                />
              </div>
            </div>

            <div className="row justify-content-center">
              <button
                className="btn btn-dark col-3 mx-5"
                type="button"
                onClick={navigateCreateUpdate}
              >
                {action.button1}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary col-3"
                onClick={navigateCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default PhotoMnt;
