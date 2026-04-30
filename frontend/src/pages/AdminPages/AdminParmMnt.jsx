import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/auth";
import { FaSearchPlus } from "react-icons/fa";
import { checkIfSignedIn, getToken } from "../../hooks/auth";
import NoPage from "../NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const AdminParmMnt = () => {
  let { isSignedIn, isAdmin } = checkIfSignedIn();
  const token = `Bearer ${getToken()}`;
  const [action, handleAction] = useState("");
  const routeParams = useParams();
  const [currValues, setCurrentValues] = useState({
    notification_type: {
      notifId: "",
      notifDesc: "",
      infoOrApproval: "",
      message: "",
    },
  });
  const canBeAddedParms = [ "", "notification_type"];
  const notifType = [
    { label: "Informational notification only", value: "INFO" },
    { label: "For approval only", value: "APRV" },
    { label: "For approval or reject", value: "APRVREJ" },
  ];
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = window.location.pathname;
    if (url === "/admincreateparm") {
      handleAction({
        type: "Creation",
        title: "CREATE PARAMETER",
        button1: "Create Parameter",
        disableUpdate: false,
      });
      setIsLoading(false);
    } else {
      setIsLoading(true);
      handleAction({
        type: "Update",
        title: "UPDATE PARAMETER",
        button1: "Update",
        disableUpdate: true,
      });
      fetch(`${backend}/admingetparmdetails/${routeParams.parmid}`, {
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
          } else {
            setCurrentValues({ ...data.details });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, []);

  const handleNotifChange = (e) => {
    const field = e.target.name;
    let newObj = { ...currValues.notification_type, [field]: e.target.value };
    setCurrentValues({
      parameterId: "notification_type",
      notification_type: newObj,
    });
  };

  const handleLoginChange = (e) => {
    const field = e.target.name;
    if (field !== "passwordCriteria") {
      let newObj = { ...currValues.login, [field]: e.target.value };
      setCurrentValues({ ...currValues, login: newObj });
    } else {
      const innerField = e.target.id;
      let newObj = { ...currValues.login.passwordCriteria };
      let newValue = e.target.value;
      if (innerField === "capitalLetterIsRequired") {
        newValue = !newObj.capitalLetterIsRequired;
      } else if (innerField === "specialCharacterIsRequired") {
        newValue = !newObj.specialCharacterIsRequired;
      } else if (innerField === "numberIsRequired") {
        newValue = !newObj.numberIsRequired;
      }
      newObj = { ...newObj, [innerField]: newValue };
      setCurrentValues({
        ...currValues,
        login: { ...currValues.login, passwordCriteria: newObj },
      });
    }
  };

  const handleAnnChange = (e) => {
    const field = e.target.name;
    let newObj = { ...currValues.dfltAnnouncement, [field]: e.target.value };
    setCurrentValues({ ...currValues, dfltAnnouncement: newObj });
  };

  
  const handleTxtChange = (e) => {
    const field = e.target.name;
    let newObj = { ...currValues.textDisplays, [field]: e.target.value };
    setCurrentValues({ ...currValues, textDisplays: newObj });
  };

  const handleParameterDetails = (e) => {
    const field = e.target.name;
    setCurrentValues({ ...currValues, [field]: e.target.value });
  };

  const navigate = useNavigate();
  const navigateCreateUpdate = () => {
    let data = { ...currValues };
    setIsLoading(true);
    if (action.type === "Creation") {
      fetch(`${backend}/admincreateparm`, {
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
            navigate("/adminsystemparameters");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      fetch(`${backend}/adminupdateparm/${routeParams.parmid}`, {
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
            navigate("/adminsystemparameters");
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
          <form action="">
            <div className="row mb-5">
              <div className="col-3 text-end">
                <label htmlFor="parameterId" className="form-label">
                  Parameter Type*
                </label>
              </div>
              <div className="col-3">
                {action.type === "Creation" && (
                  <select
                    id="parameterId"
                    name="parameterId"
                    type="text"
                    className="form-control"
                    onChange={handleParameterDetails}
                  >
                    {canBeAddedParms.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {action.type !== "Creation" && (
                  <input
                    name="parameterId"
                    type="text"
                    className="form-control"
                    value={currValues.parameterId}
                    disabled={true}
                  />
                )}
              </div>
            </div>

            {currValues.parameterId === "notification_type" && (
              <div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="notifId" className="form-label">
                      Notification Id*
                    </label>
                  </div>
                  <div className="col-4">
                    <input
                      id="notifId"
                      name="notifId"
                      type="text"
                      className="form-control"
                      value={currValues.notification_type.notifId}
                      onChange={handleNotifChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="notifDesc" className="form-label">
                      Notification Description*
                    </label>
                  </div>
                  <div className="col-8">
                    <input
                      id="notifDesc"
                      name="notifDesc"
                      type="text"
                      className="form-control"
                      value={currValues.notification_type.notifDesc}
                      onChange={handleNotifChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="infoOrApproval" className="form-label">
                      Notification Type*
                    </label>
                  </div>
                  <div className="col-4">
                    <select
                      id="infoOrApproval"
                      name="infoOrApproval"
                      type="text"
                      className="form-control"
                      value={currValues.notification_type.infoOrApproval}
                      onChange={handleNotifChange}
                    >
                      {notifType.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 text-end">
                    <label htmlFor="notifHousekeeping" className="form-label">
                      Number of Days Notifications are Stored
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="notifHousekeeping"
                      name="notifHousekeeping"
                      type="number"
                      min="1"
                      className="form-control"
                      value={currValues.notification_type.notifHousekeeping}
                      onChange={handleNotifChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="message" className="form-label">
                      Notification Message
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="message"
                      name="message"
                      className="form-control form-control-sm"
                      value={currValues.notification_type.message}
                      onChange={handleNotifChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {currValues.parameterId === "login" && (
              <div>
                <div className="row mb-3">
                  <div className="col-6 text-end">
                    <label
                      htmlFor="numberOfLoginDtlsToKeep"
                      className="form-label"
                    >
                      Number of Successful Login Details to Keep*
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="numberOfLoginDtlsToKeep"
                      name="numberOfLoginDtlsToKeep"
                      type="number"
                      min="1"
                      className="form-control"
                      value={currValues.login.numberOfLoginDtlsToKeep}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 text-end">
                    <label htmlFor="defaultLoginTries" className="form-label">
                      Default Minimum Login Tries Allowed*
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="defaultLoginTries"
                      name="defaultLoginTries"
                      type="number"
                      min="1"
                      className="form-control"
                      value={currValues.login.defaultLoginTries}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 text-end">
                    <label
                      htmlFor="maxAdditionalLoginTries"
                      className="form-label"
                    >
                      Maximum Additional Login Tries (on top of default
                      minimum)*
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="maxAdditionalLoginTries"
                      name="maxAdditionalLoginTries"
                      type="number"
                      min="0"
                      className="form-control"
                      value={currValues.login.maxAdditionalLoginTries}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 text-end">
                    <label htmlFor="lockedAccountTiming" className="form-label">
                      Number of Minutes Account may be Locked*
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="lockedAccountTiming"
                      name="lockedAccountTiming"
                      type="number"
                      min="1"
                      className="form-control"
                      value={currValues.login.lockedAccountTiming}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 text-end">
                    <label htmlFor="otpExpiry" className="form-label">
                      Number of Minutes OTP may be valid*
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="otpExpiry"
                      name="otpExpiry"
                      type="number"
                      min="1"
                      className="form-control"
                      value={currValues.login.otpExpiry}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3 mt-5">
                  <div className="text-center fw-bold">
                    <p>PASSWORD CRITERIA</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="minPasswordLength" className="form-label">
                      Minimum length of password*
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="minPasswordLength"
                      name="minPasswordLength"
                      type="number"
                      min="1"
                      className="form-control"
                      value={currValues.login.minPasswordLength}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label
                      htmlFor="capitalLetterIsRequired"
                      className="form-label"
                    >
                      Capital Letter is Required
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="capitalLetterIsRequired"
                      name="passwordCriteria"
                      type="checkbox"
                      className="form-check-input"
                      defaultChecked={
                        currValues.login.passwordCriteria
                          .capitalLetterIsRequired && "checked"
                      }
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="col-3 text-end">
                    <label htmlFor="capitalLettersList" className="form-label">
                      List of Capital Letters*
                    </label>
                  </div>
                  <div className="col-5">
                    <input
                      id="capitalLettersList"
                      name="passwordCriteria"
                      type="text"
                      className="form-control"
                      value={
                        currValues.login.passwordCriteria.capitalLettersList
                      }
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label
                      htmlFor="specialCharacterIsRequired"
                      className="form-label"
                    >
                      Special Character is Required
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="specialCharacterIsRequired"
                      name="passwordCriteria"
                      type="checkbox"
                      className="form-check-input"
                      defaultChecked={
                        currValues.login.passwordCriteria
                          .specialCharacterIsRequired && "checked"
                      }
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="col-3 text-end">
                    <label htmlFor="specialCharsList" className="form-label">
                      List of Special Characters*
                    </label>
                  </div>
                  <div className="col-5">
                    <input
                      id="specialCharsList"
                      name="passwordCriteria"
                      type="text"
                      className="form-control"
                      value={currValues.login.passwordCriteria.specialCharsList}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="numberIsRequired" className="form-label">
                      Number is Required
                    </label>
                  </div>
                  <div className="col-1">
                    <input
                      id="numberIsRequired"
                      name="passwordCriteria"
                      type="checkbox"
                      className="form-check-input"
                      defaultChecked={
                        currValues.login.passwordCriteria.numberIsRequired &&
                        "checked"
                      }
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="col-3 text-end">
                    <label htmlFor="numbersList" className="form-label">
                      List of Numbers*
                    </label>
                  </div>
                  <div className="col-5">
                    <input
                      id="numbersList"
                      name="passwordCriteria"
                      type="text"
                      className="form-control"
                      value={currValues.login.passwordCriteria.numbersList}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {currValues.parameterId === "textDisplays" && (
              <div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="pageName" className="form-label">
                      pageName
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="pageName"
                      name="pageName"
                      className="form-control form-control-sm"
                      value={currValues.textDisplays.pageName}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label
                      htmlFor="message1"
                      className="form-label"
                    >
                      Message 1
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="message1"
                      name="message1"
                      rows="5"
                      className="form-control form-control-sm"
                      value={currValues.textDisplays.message1}
                      onChange={handleTxtChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label
                      htmlFor="message2"
                      className="form-label"
                    >
                      Message 2
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="message2"
                      name="message2"
                      rows="5"
                      className="form-control form-control-sm"
                      value={currValues.textDisplays.message2}
                      onChange={handleTxtChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label
                      htmlFor="message3"
                      className="form-label"
                    >
                      Message 3
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="message3"
                      name="message3"
                      rows="5"
                      className="form-control form-control-sm"
                      value={currValues.textDisplays.message3}
                      onChange={handleTxtChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {currValues.parameterId === "dfltAnnouncement" && (
              <div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label htmlFor="defaultMsgTeamAncmt" className="form-label">
                      Default Team Announcement
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="defaultMsgTeamAncmt"
                      name="defaultMsgTeamAncmt"
                      className="form-control form-control-sm"
                      value={currValues.dfltAnnouncement.defaultMsgTeamAncmt}
                      onChange={handleAnnChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-3 text-end">
                    <label
                      htmlFor="defaultMsgLeagueAncmt"
                      className="form-label"
                    >
                      Default League Announcement
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      id="defaultMsgLeagueAncmt"
                      name="defaultMsgLeagueAncmt"
                      className="form-control form-control-sm"
                      value={currValues.dfltAnnouncement.defaultMsgLeagueAncmt}
                      onChange={handleAnnChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="row justify-content-center mt-5">
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

export default AdminParmMnt;
