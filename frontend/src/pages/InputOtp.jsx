import { useState } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/auth";

const InputOTP = () => {
  const [otp, setOTP] = useState("");

  const {
    verifyOTP,
    otpError,
    setOTPError,
    setOTPErrorMessage,
    otpErrorMessage,
  } = useAuth();

  const location = useLocation();
  const fromPage = location.state.fromPage;
  const navigate = useNavigate();
  const navigateResetPassword = () => {
    if (fromPage === "Register") {
      verifyOTP(Number(otp), "/", navigate);
    } else {
      verifyOTP(Number(otp), "/resetpassword", navigate);
    }
  };

  return (
    <div className="card-wrapper">
      <Card style={{ width: "25rem", padding: 20 }}>
        <h2 className="mb-4 center-text">Enter Verification Code</h2>
        {otpError && otpError !== "" && (
          <div className="alert alert-danger mb-3 p-1">
            <p className="mb-0">{otpErrorMessage}</p>
          </div>
        )}
        <form action="">
          <div className="mb-3">
            <input
              id="otp"
              name="otp"
              type="number"
              min="0"
              className="form-control"
              onChange={(e) => setOTP(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-evenly width:100% mb-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (otp.length === 6) {
                  navigateResetPassword();
                } else {
                  setOTPError(true);
                  setOTPErrorMessage("Invalid OTP");
                }
              }}
            >
              Verify Code
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InputOTP;
