import { useState, useEffect, useRef } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useAuth, { checkIfSignedIn, getToken } from "../hooks/auth";
import NoPage from "./NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";
const backendLogos = backend.trim() + "/images/logos";

const RoomMaintenance = () => {
  const { isSignedIn } = useAuth();
  const token = `Bearer ${getToken()}`;
  const routeParams = useParams();
  const inputFileLogo = useRef(null);
  const [isRoomAdmin, setRoomAdmin] = useState(false);
  const [action, handleAction] = useState({
    type: "Creation",
    title: "CREATE ROOM",
  });
  const [currValues, setCurrentValues] = useState({
    roomName: "",
    shortDesc: "",
    description: "",
    basePrice: "",
    maxPax: 1,
    dspPriority: 10,
  });
  const [logoChanged, setLogoChanged] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoURL, setLogoURL] = useState(null);
  const [disableDelete, setDeleteButton] = useState(true);
  const [oldValues, setOldValues] = useState(null);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = window.location.pathname.substring(1, 7).toLowerCase();
    if (url === "create") {
      handleAction({ type: "Creation", title: "Create Room" });
      setIsLoading(false);
    } else {
      handleAction({ type: "Update", title: "Update Room" });
      fetch(`${backend}/getroomdetailsupdate/${routeParams.roomid}`, {
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
            setRoomAdmin(true);
            setCurrentValues({
              roomName: data.details.roomName,
              shortDesc: data.details.shortDesc,
              description: data.details.description,
              basePrice: data.details.basePrice,
              maxPax: data.details.maxPax,
              dspPriority: data.details.dspPriority,
            });
            let oldLogo = "";
            fetch(`${backendLogos}/${data.details.roomName}.jpeg`).then(
              (res) => {
                if (res.ok) {
                  setLogoURL(
                    `${backendLogos}/${data.details.roomName}.jpeg`
                  );
                  setSelectedLogo("x");
                  oldLogo = "x";
                }
                setOldValues({
                  roomName: data.details.roomName,
                  shortDesc: data.details.shortDesc,
                  description: data.details.description,
                  basePrice: data.details.basePrice,
                  maxPax: data.details.maxPax,
                  dspPriority: data.details.dspPriority,
                  logo: oldLogo === "x" ? "x" : null,
                })
              }
            )
            handleAction({ type: "Update", title: "Update Room" });
            setDeleteButton(false);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, [location.pathname]);

  const handleLogoChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedLogo(event.target.files[0]);
      setCurrentValues({ ...currValues, logo: event.target.files[0] });
      setLogoURL(URL.createObjectURL(event.target.files[0]));
      setLogoChanged(true)
    }
  };

  const handleLogoRemove = () => {
    setSelectedLogo(null);
    setCurrentValues({ ...currValues, logo: null });
    setLogoURL(null);
    setLogoChanged(action.type === "Creation" ? false : true)
  };

  const handleRoomDetails = (e) => {
    const arrOfNumerics = ["maxPax", "dspPriority"];
    const field = e.target.name;
    if (arrOfNumerics.find((e) => e === field)) {
      setCurrentValues({ ...currValues, [field]: Number(e.target.value) });
    } else {
      setCurrentValues({ ...currValues, [field]: e.target.value });
    }
  };

  const dateFormat = (date, type) => {
    let dateIn = new Date(date);
    if (type === "ISO") {
      return dateIn.toISOString().substring(0, 10);
    } else {
      return dateIn.toDateString();
    }
  };

  const checkIfUserIsSignedIn = () => {
    let user = checkIfSignedIn();
    if (!user.isSignedIn) {
      navigate("/signin");
    }
  };

  const navigate = useNavigate();
  const navigateCancel = () => {
    if (action.type === "Creation") {
      navigate("/rooms");
    } else {
      navigate("/room/" + routeParams.roomid);
    }
  };

  const navigateRoomDetails = () => {
    let error = false;
    error = validateInput();
    if (!error) {
      let data = { ...currValues, logoChanged: logoChanged };
      //let data = { ...currValues, logoChanged: false }; //TEMP
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        Array.isArray(data[key])
          ? data[key].forEach((value) => formData.append(key + "[]", value))
          : formData.append(key, data[key]);
      });
      if (action.type === "Creation") {
        setIsLoading(true);
        fetch(`${backend}/createroom`, {
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
              if (data.errField !== "") {
                document.getElementById(data.errField).focus();
              }
            } else {
              navigate("/room/" + data.room._id);
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
      } else {
        if (
          oldValues.roomName == currValues.roomName &&
          oldValues.shortDesc == currValues.shortDesc &&
          oldValues.description == currValues.description &&
          oldValues.basePrice == currValues.basePrice &&
          oldValues.maxPax == currValues.maxPax &&
          oldValues.dspPriority == currValues.dspPriority &&
          logoChanged == false
        ) {
          alert("NO CHANGES FOUND!");
        } else {
          setIsLoading(true);
          fetch(`${backend}/updateroom/${routeParams.roomid}`, {
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
                if (data.errField !== "") {
                  document.getElementById(data.errField).focus();
                }
              } else {
                navigate("/room/" + routeParams.roomid);
              }
              setIsLoading(false);
            })
            .catch((error) => {
              console.log(error);
              setIsLoading(false);
            });
        }
      }
    }
  };

  const validateInput = () => {
    let errResp = false;
    let errMsgs = [];
    let focusON = false;
    if (currValues.roomName.trim() === "") {
      errMsgs.push("Room name is required.");
      document.getElementById("roomName").focus();
      focusON = true;
    }
    if (currValues.shortDesc.trim() === "") {
      errMsgs.push("Short room description is required.");
      if (!focusON) {
        document.getElementById("shortDesc").focus();
        focusON = true;
      }
    }
    if (currValues.description.trim() === "") {
      errMsgs.push("Room description is required.");
      if (!focusON) {
        document.getElementById("description").focus();
        focusON = true;
      }
    }
    if (currValues.maxPax < 1) {
      errMsgs.push("Maximum number of guests must at least be 1.");
      if (!focusON) {
        document.getElementById("maxPax").focus();
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

  const navigateDelete = () => {
    if (
      confirm(
        "Please confirm if you want to proceed with deletion of this room."
      )
    ) {
      setIsLoading(true);
      let data = oldValues
      fetch(`${backend}/deleteroom/${routeParams.roomid}`, {
        method: "DELETE",
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
            navigate("/rooms");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      console.log("Deletion cancelled");
    }
  };

  return (
    <div className="d-flex container mt-2 justify-content-center">
      {!isSignedIn && (
        <div>
          <NoPage />
        </div>
      )}
      {isLoading ? (
        <div className="loading-overlay">
          <div style={{ color: "black" }}>Loading...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {action.type == "Update" && !isRoomAdmin ? (
            <div>
              <NoPage />
            </div>
          ) : (
            <Card style={{ width: "90rem", padding: 20 }}>
              {errorMessage.length > 0 && (
                <div className="alert alert-danger mb-3 p-1">
                  {errorMessage.map((err, index) => (
                    <p className="mb-0" key={index}>
                      {err}
                    </p>
                  ))}
                </div>
              )}
              <h2 className="mb-4 center-text">{action.title.toUpperCase()}</h2>
              <form action="" encType="multipart/form-data">
                <div className="row">
                  <div className="col-sm-9 mb-3">
                    <div className="row">
                      <div className="col-sm-7 mb-3">
                        <label htmlFor="roomName" className="form-label">
                          Name of Room*
                        </label>
                        <input
                          id="roomName"
                          name="roomName"
                          type="text"
                          className="form-control"
                          value={currValues.roomName}
                          onChange={handleRoomDetails}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-sm-11 mb-3">
                      <label htmlFor="shortDesc" className="form-label">
                        Short description
                      </label>
                      <textarea
                        id="shortDesc"
                        name="shortDesc"
                        type="text"
                        rows="2"
                        className="form-control form-control-sm"
                        value={currValues.shortDesc}
                        onChange={handleRoomDetails}
                        required
                      />
                    </div>
                    <div className="col-sm-11 mb-3">
                      <label htmlFor="description" className="form-label">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        type="text"
                        rows="4"
                        className="form-control form-control-sm"
                        value={currValues.description}
                        onChange={handleRoomDetails}
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-sm-3 mb-3">
                        <label htmlFor="basePrice" className="form-label">
                          Base Price
                        </label>
                        <input
                          id="basePrice"
                          name="basePrice"
                          className="form-control"
                          value={currValues.basePrice}
                          onChange={handleRoomDetails}
                        />
                      </div>
                      <div className="col-sm-3 mb-3 mx-3">
                        <label htmlFor="maxPax" className="form-label">
                          Maximum number of guests
                        </label>
                        <input
                          id="maxPax"
                          name="maxPax"
                          type="number"
                          min="1"
                          className="form-control"
                          value={currValues.maxPax}
                          onChange={handleRoomDetails}
                          required
                        />
                      </div>
                      <div className="col-sm-3 mb-3 mx-3">
                        <label htmlFor="dspPriority" className="form-label">
                          Listing display priority
                        </label>
                        <input
                          id="dspPriority"
                          name="dspPriority"
                          type="number"
                          min="1"
                          className="form-control"
                          value={currValues.dspPriority}
                          onChange={handleRoomDetails}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-3 mb-3 text-center">
                    <label htmlFor="logo" className="form-label">
                      Select Logo
                    </label>
                    {selectedLogo && (
                      <div>
                        <img
                          src={logoURL}
                          alt="not found"
                          className="rounded mw-100 mb-2 border border-secondary"
                          style={{ width: "20em", height: "20em" }}
                        />
                        <button
                          onClick={() => handleLogoRemove()}
                          className="btn btn-secondary m-3 mx-1 btn-sm"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary m-3 btn-sm"
                          onClick={() => inputFileLogo.current.click()}
                        >
                          Replace
                        </button>
                      </div>
                    )}
                    {!selectedLogo && (
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="rounded mw-100 mb-3 border border-secondary"
                          style={{ width: "20em", height: "20em" }}
                          viewBox="-12 -12 40 40"
                        >
                          <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                          <path d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z" />
                        </svg>
                        <button
                          type="button"
                          className="btn btn-secondary m-3 btn-sm"
                          onClick={() => inputFileLogo.current.click()}
                        >
                          Upload
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      className="d-none"
                      onChange={handleLogoChange}
                      accept="image/*"
                      ref={inputFileLogo}
                    />
                  </div>
                </div>
                <div className="row justify-content-center">
                  <button
                    className="btn btn-dark col-3"
                    type="button"
                    onClick={navigateRoomDetails}
                  >
                    {action.title}
                  </button>
                  {action.type !== "Creation" && (
                    <button
                      type="button"
                      className="btn btn-danger col-3"
                      disabled={disableDelete}
                      onClick={navigateDelete}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-secondary col-3"
                    onClick={navigateCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {action.type === "Update"}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default RoomMaintenance;
