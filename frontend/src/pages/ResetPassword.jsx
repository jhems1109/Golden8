import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/auth";

const ResetPassword = () => {
  const { resetPassword, resetPasswordError } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const navigateSignin = () => {
    if (newPassword.length < 8 || confirmNewPassword.length < 8) {
      setError("Password must be at least 8 characters.");
    } else if (newPassword === confirmNewPassword) {
      setError("");
      resetPassword(newPassword, confirmNewPassword, navigate);
    } else {
      setError("Passwords do not match");
    }
  };

  return (
    <div className="card-wrapper">
      <Card style={{ width: "25rem", padding: 20 }}>
        {error.length > 0 && (
          <div className="alert alert-danger mb-3 p-1">
            <p className="mb-0">{error}</p>
          </div>
        )}
        {resetPasswordError && resetPasswordError !== "" && (
          <div className="alert alert-danger mb-3 p-1">
            <p className="mb-0">{resetPasswordError}</p>
          </div>
        )}
        <h2 className="mb-4 center-text">Reset Password</h2>
        <form action="">
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password*
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="form-control"
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password*
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              className="form-control"
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
              }}
            />
          </div>
          <div className="d-flex justify-content-evenly width:100% mb-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={navigateSignin}
            >
              Reset Password
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
