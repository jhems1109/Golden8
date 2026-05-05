import { useState, useEffect, useRef } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate, useParams } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import { FaTrash, FaPlusCircle } from "react-icons/fa";
import { checkIfSignedIn, getToken } from "../../hooks/auth";
import NoPage from "../NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const AdminUserMnt = () => {
  let { isSignedIn, isAdmin } = checkIfSignedIn();
  const token = `Bearer ${getToken()}`;
  const inputFile = useRef(null);
  const routeParams = useParams();
  const [action, handleAction] = useState("");
  const [currValues, setCurrentValues] = useState({
    userName: "",
    password: "",
    userType: "USER",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    successfulLoginDetails: [{ sourceIPAddress: "", timestamp: null }],
    failedLoginDetails: {
      numberOfLoginTries: 0,
      numberOfFailedLogins: 0,
      failedLogins: [{ sourceIPAddress: "", timestamp: null }],
      consecutiveLockedOuts: 0,
      lockedTimestamp: null,
    },
    detailsOTP: { OTP: "", expiryTimeOTP: null },
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const roleOptions = [
    { label: "Regular user", value: "USER" },
    { label: "System admin", value: "ADMIN" },
  ];
  const accountStatus = [
    { label: "Active", value: "ACTV" },
    { label: "Locked", value: "LOCK" },
    { label: "Pending", value: "PEND" },
  ];
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = window.location.pathname;
    if (url === "/admincreateuser") {
      handleAction({
        type: "Creation",
        title: "CREATE USER ACCOUNT",
        button1: "Create Account",
      });
      setIsLoading(false);
    } else {
      handleAction({
        type: "Update",
        title: "UPDATE USER ACCOUNT",
        button1: "Update",
      });
      fetch(`${backend}/admingetuser/${routeParams.userid}`, {
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
              status: details.status,
              userName: details.userName,
              email: details.email,
              password: details.password,
              salt: details.salt,
              userType: details.userType,
              phoneNumber: details.phoneNumber,
              firstName: details.firstName,
              lastName: details.lastName,
              successfulLoginDetails: [...details.successfulLoginDetails],
              failedLoginDetails:
                details.failedLoginDetails !== null
                  ? { ...details.failedLoginDetails }
                  : currValues.failedLoginDetails,
              detailsOTP:
                details.detailsOTP && details.detailsOTP !== null
                  ? { ...details.detailsOTP }
                  : currValues.detailsOTP,
              createdAt: details.createdAt,
              updatedAt: details.updatedAt,
            });
            fetch(details.imageURL).then(
              (res) => {
                if (res.ok) {
                  setImageURL(details.imageURL);
                  setSelectedImage("x");
                }
              }
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

  const handlePhotoChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedImage(event.target.files[0]);
      setImageURL(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSuccLoginChange = (event, index) => {
    const field = event.target.name;
    let newList = [...currValues.successfulLoginDetails];
    newList[index][field] = event.target.value;
    setCurrentValues({ ...currValues, successfulLoginDetails: newList });
  };

  const handlefailedLoginDetails = (event) => {
    const field = event.target.name;
    let newList = { ...currValues.failedLoginDetails };
    if (field !== "lockedTimestamp") {
      newList[field] = Number(event.target.value);
    } else {
      newList[field] = event.target.value;
    }
    setCurrentValues({ ...currValues, failedLoginDetails: newList });
  };

  const handleFailedLoginChange = (event, index) => {
    const field = event.target.name;
    let newList = { ...currValues.failedLoginDetails };
    newList.failedLogins[index][field] = event.target.value;
    setCurrentValues({ ...currValues, failedLoginDetails: newList });
  };

  const handleAccountDetails = (e) => {
    const field = e.target.name;
    setCurrentValues({ ...currValues, [field]: e.target.value });
  };

  const handleOTPChange = (e) => {
    const field = e.target.name;
    let newList = { ...currValues.detailsOTP, [field]: e.target.value };
    setCurrentValues({ ...currValues, detailsOTP: newList });
  };

  /*const handleAnnouncements = (event, index) => {
        const field = event.target.name
        let newList = [...currValues.announcementsCreated]
        if (field === "showInHome") {
            newList[index].showInHome = !newList[index].showInHome
            setCurrentValues({ ...currValues, announcementsCreated : newList })
        } else {
            newList[index][field] = event.target.value
            setCurrentValues({ ...currValues, announcementsCreated : newList })
        }
      }

    const addAdminAnnouncement = () => {
        let newList = [...currValues.announcementsCreated]
        newList.push({ announcementMsg: "", showInHome: false })
        setCurrentValues({ ...currValues, announcementsCreated : newList })
    }

    const removeAdminAnnouncement = (index) => {
        console.log(index)
        let newList = [...currValues.announcementsCreated]
        newList = newList.filter((items, itemIndex) => itemIndex !== index)
        setCurrentValues({ ...currValues, announcementsCreated : newList })
    }*/

  const navigate = useNavigate();
  const navigateCreateUpdate = () => {
    let data = {};
    setIsLoading(true);
    if (action.type === "Creation") {
      data = { ...currValues };
      //data.logo = selectedLogo
      //data.banner = selectedBanner
      fetch(`${backend}/admincreateuser`, {
        method: "POST",
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
          } else {
            navigate("/adminusers");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      data = { ...currValues };
      //data.logo = selectedLogo
      //data.banner = selectedBanner
      fetch(`${backend}/adminupdateuser/${routeParams.userid}`, {
        method: "POST",
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
            navigate("/adminusers");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  };

  const navigateCancel = () => {
    navigate(-1);
  };

  return (
    <div className="d-flex container mt-2 justify-content-center">
      {!isSignedIn || !isAdmin ? (
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
            {action.type !== "Creation" && (
              <div className="row mb-2">
                <div className="col-2 text-end">
                  <label htmlFor="status" className="form-label">
                    Account status*
                  </label>
                </div>
                <div className="col-4">
                  <select
                    id="status"
                    name="status"
                    type="text"
                    className="form-control"
                    value={currValues.status}
                    onChange={handleAccountDetails}
                  >
                    {accountStatus.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="userName" className="form-label">
                  Username*
                </label>
              </div>
              <div className="col-4">
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  className="form-control"
                  value={currValues.userName}
                  onChange={handleAccountDetails}
                />
              </div>
              <div className="col-2 text-end">
                <label htmlFor="password" className="form-label">
                  Password*
                </label>
              </div>
              <div className="col-4">
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={currValues.password}
                  onChange={handleAccountDetails}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="userType" className="form-label">
                  Role*
                </label>
              </div>
              <div className="col-4">
                <select
                  id="userType"
                  name="userType"
                  type="text"
                  className="form-control"
                  value={currValues.userType}
                  onChange={handleAccountDetails}
                >
                  {roleOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-2 text-end">
                <label htmlFor="email" className="form-label">
                  Email*
                </label>
              </div>
              <div className="col-4">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={currValues.email}
                  onChange={handleAccountDetails}
                />
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="firstName" className="form-label">
                  First Name*
                </label>
              </div>
              <div className="col-4">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="form-control"
                  value={currValues.firstName}
                  onChange={handleAccountDetails}
                />
              </div>
              <div className="col-2 text-end">
                <label htmlFor="lastName" className="form-label">
                  Last Name*
                </label>
              </div>
              <div className="col-4">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="form-control"
                  value={currValues.lastName}
                  onChange={handleAccountDetails}
                />
              </div>
              <br></br>
              <br></br>
              <br></br>
            </div>
            <div className="row">
              {action.type !== "Creation" && (
                <>
                  <div className="row mt-3">
                    <div className="col-2 text-end">
                      <label
                        htmlFor="successfulLoginDetails"
                        className="form-label"
                      >
                        Successful Logins :{" "}
                      </label>
                    </div>
                    <div className="col-3 text-center">
                      <label htmlFor="sourceIpAddress" className="form-label">
                        IP Address
                      </label>
                    </div>
                    <div className="col-4 text-center">
                      <label htmlFor="timestamp" className="form-label">
                        Timestamp
                      </label>
                    </div>
                  </div>
                  <div className="col mb-1">
                    {currValues.successfulLoginDetails.map((login, index) => (
                      <div className="row" key={index}>
                        <p className="col-2"></p>
                        <div className="col-3 mb-1">
                          <input
                            name="sourceIPAddress"
                            type="text"
                            className="form-control"
                            value={login.sourceIPAddress}
                            onChange={(e) => handleSuccLoginChange(e, index)}
                          />
                        </div>
                        <div className="col-4 mb-1">
                          <input
                            name="timestamp"
                            type="text"
                            className="form-control"
                            value={login.timestamp}
                            onChange={(e) => handleSuccLoginChange(e, index)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="row mt-2">
                    <div className="col-2 text-end">
                      <label
                        htmlFor="failedLoginDetails"
                        className="form-label"
                      >
                        Failed Login Details :{" "}
                      </label>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-end">
                      <label
                        htmlFor="numberOfLoginTries"
                        className="form-label"
                      >
                        Number of Failed Login Tries Allowed
                      </label>
                    </div>
                    <div className="col-1">
                      <input
                        id="numberOfLoginTries"
                        name="numberOfLoginTries"
                        type="number"
                        min="0"
                        className="form-control"
                        value={currValues.failedLoginDetails.numberOfLoginTries}
                        onChange={handlefailedLoginDetails}
                      />
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-end">
                      <label
                        htmlFor="numberOfFailedLogins"
                        className="form-label"
                      >
                        Number of Failed Logins
                      </label>
                    </div>
                    <div className="col-1">
                      <input
                        id="numberOfFailedLogins"
                        name="numberOfFailedLogins"
                        type="number"
                        min="0"
                        className="form-control"
                        value={
                          currValues.failedLoginDetails.numberOfFailedLogins
                        }
                        onChange={handlefailedLoginDetails}
                      />
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-end">
                      <label
                        htmlFor="consecutiveLockedOuts"
                        className="form-label"
                      >
                        Consecutive times account was locked-out
                      </label>
                    </div>
                    <div className="col-1">
                      <input
                        id="consecutiveLockedOuts"
                        name="consecutiveLockedOuts"
                        type="number"
                        min="0"
                        className="form-control"
                        value={
                          currValues.failedLoginDetails.consecutiveLockedOuts
                        }
                        onChange={handlefailedLoginDetails}
                      />
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-end">
                      <label htmlFor="lockedTimestamp" className="form-label">
                        Timestamp Account is Locked out
                      </label>
                    </div>
                    <div className="col-4">
                      <input
                        id="lockedTimestamp"
                        name="lockedTimestamp"
                        type="text"
                        className="form-control"
                        value={currValues.failedLoginDetails.lockedTimestamp}
                        onChange={handlefailedLoginDetails}
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-4 text-end">
                      <label htmlFor="failedLogins" className="form-label">
                        Failed Logins :{" "}
                      </label>
                    </div>
                    <div className="col-3 text-center">
                      <label htmlFor="sourceIpAddress" className="form-label">
                        IP Address
                      </label>
                    </div>
                    <div className="col-4 text-center">
                      <label htmlFor="timestamp" className="form-label">
                        Timestamp
                      </label>
                    </div>
                  </div>
                  <div className="col mb-1">
                    {currValues.failedLoginDetails.failedLogins.map(
                      (login, index) => (
                        <div className="row" key={index}>
                          <p className="col-4"></p>
                          <div className="col-3 mb-1">
                            <input
                              name="sourceIpAddress"
                              type="text"
                              className="form-control"
                              value={login.sourceIpAddress}
                              onChange={(e) =>
                                handleFailedLoginChange(e, index)
                              }
                            />
                          </div>
                          <div className="col-4 mb-1">
                            <input
                              name="timestamp"
                              type="text"
                              className="form-control"
                              value={login.timestamp}
                              onChange={(e) =>
                                handleFailedLoginChange(e, index)
                              }
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="row">
                    <div className="col-2 text-end">
                      <label htmlFor="detailsOTP" className="form-label">
                        OTP Details :{" "}
                      </label>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-end">
                      <label htmlFor="detailsOTP" className="form-label">
                        One Time Password
                      </label>
                    </div>
                    <div className="col-2">
                      <input
                        id="detailsOTP"
                        name="OTP"
                        type="number"
                        min="0"
                        className="form-control"
                        value={currValues.detailsOTP.OTP}
                        onChange={handleOTPChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-end">
                      <label htmlFor="expiryTimeOTP" className="form-label">
                        OTP Expiry Timestamp
                      </label>
                    </div>
                    <div className="col-4">
                      <input
                        id="expiryTimeOTP"
                        name="expiryTimeOTP"
                        type="text"
                        className="form-control"
                        value={currValues.detailsOTP.expiryTimeOTP}
                        onChange={handleOTPChange}
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-3 text-end">
                      <label htmlFor="createdAt" className="form-label">
                        Date of Account Creation :
                      </label>
                    </div>
                    <div className="col-4">
                      <p className="form-label">{currValues.createdAt}</p>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-3 text-end">
                      <label htmlFor="updatedAt" className="form-label">
                        Account Latest Update Date :
                      </label>
                    </div>
                    <div className="col-4">
                      <p className="form-label">{currValues.updatedAt}</p>
                    </div>
                  </div>
                  <p />
                </>
              )}
            </div>

            <div className="row justify-content-center mt-3">
              <div className="col-3 mb-3 text-center">
                <label htmlFor="upload" className="form-label ">
                  Profile Picture
                </label>
                {selectedImage && (
                  <div>
                    <img
                      src={imageURL}
                      alt="profile picture"
                      className="rounded mw-100 mb-2 border border-secondary"
                      style={{ width: "100rem", height: "13rem" }}
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="btn btn-secondary mb-3 mx-1 btn-sm"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mb-3 btn-sm"
                      onClick={() => inputFile.current.click()}
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
                      style={{ width: "100rem", height: "13rem" }}
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
                className="btn btn-dark col-2 mx-5"
                type="button"
                onClick={navigateCreateUpdate}
              >
                {action.button1}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary col-2"
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

export default AdminUserMnt;
