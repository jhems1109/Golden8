import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth, { checkIfSignedIn, getToken } from "../hooks/auth";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const token = `Bearer ${getToken()}`;
  const navigateReturn = () => {
    navigate(-1);
  };
  const [input, setInput] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState([]);

  const checkIfUserIsSignedIn = () => {
    let user = checkIfSignedIn();
    if (!user.isSignedIn) {
      navigate("/"); //JAM Changed from /signin to avoid guests being routed to signin page
    }
  };

  const onInputChange = (e) => {
    const field = e.target.name;
    setInput({ ...input, [field]: e.target.value });
  };

  const navigateSubmitChange = () => {
    let data = {};
    let error = false;
    error = validateInput();
    if (!error) {
      data = { ...input };
      fetch(`${backend}/changepassword`, {
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
            navigate(-1);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const validateInput = () => {
    let errResp = false;
    let errMsgs = [];
    let focusON = false;
    if (input.currentPassword.trim() === "") {
      errMsgs.push("Current password is required.");
      document.getElementById("currentPassword").focus();
      focusON = true;
    }
    if (input.newPassword.trim() === "") {
      errMsgs.push("New password is required.");
      if (!focusON) {
        document.getElementById("newPassword").focus();
        focusON = true;
      }
    }
    if (
      input.currentPassword.trim() !== "" &&
      input.currentPassword.trim() === input.newPassword.trim()
    ) {
      errMsgs.push("Current and new passwords cannot be the same.");
      if (!focusON) {
        document.getElementById("newPassword").focus();
        focusON = true;
      }
    }
    if (input.confirmNewPassword.trim() === "") {
      errMsgs.push("Confirm new password is required.");
      if (!focusON) {
        document.getElementById("confirmNewPassword").focus();
        focusON = true;
      }
    }
    if (
      input.newPassword.trim() !== "" &&
      input.confirmNewPassword.trim() !== "" &&
      input.newPassword.trim() !== input.confirmNewPassword.trim()
    ) {
      errMsgs.push("New password and confirm new password must be the same.");
      if (!focusON) {
        document.getElementById("confirmNewPassword").focus();
        focusON = true;
      }
    }
    setErrorMessage(errMsgs);
    if (errMsgs.length > 0) {
      errResp = true;
    }
    return errResp;
  };

  return (
    <div className="card-wrapper mt-5 ">
      {!isSignedIn && <div>{checkIfUserIsSignedIn()}</div>}
      <Card style={{ width: "25rem", padding: 20 }}>
        {errorMessage.length > 0 && (
          <div className="alert alert-danger mb-3 p-1">
            {errorMessage.map((err, index) => (
              <p className="mb-0" key={index}>
                {err}
              </p>
            ))}
          </div>
        )}
        <h2 className="mb-4 center-text">Change Password</h2>
        <form action="">
          <div className="mb-3">
            <label htmlFor="currentPassword" className="form-label">
              Current Password*
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              className="form-control"
              value={input.currentPassword}
              onChange={onInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password*
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="form-control"
              value={input.newPassword}
              onChange={onInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmNewPassword" className="form-label">
              Confirm New Password*
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              className="form-control"
              value={input.confirmNewPassword}
              onChange={onInputChange}
            />
          </div>
          <div className="d-flex justify-content-evenly width:100% mb-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={navigateSubmitChange}
            >
              Change Password
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={navigateReturn}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
