import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/auth";

const SignIn = () => {
  const navigate = useNavigate();
  const {
    signIn,
    isSignedIn,
    login,
    loginError,
    isLoginError,
    isLoading,
    setIsUserRemembered,
  } = useAuth();
  const [inputError, setInputError] = useState(false);

  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState({
    username: "",
    password: "",
  });

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateInput(e);
  };

  const validateInput = (e) => {
    let { name, value } = e.target;
    setError((prev) => {
      const stateObj = { ...prev, [name]: "" };
      switch (name) {
        case "username":
          if (!value) {
            stateObj[name] = "Username/Email is required.";
          }
          break;
        case "password":
          if (!value) {
            stateObj[name] = "Password is required.";
          }
          break;
        default:
          break;
      }
      return stateObj;
    });
  };

  const navigateForgotPassword = () => {
    navigate("/forgotpassword");
  };
  const navigateRegister = () => {
    navigate("/register");
  };

  return (
    <div className="card-wrapper mt-5 ">
      <Card style={{ width: "25rem", padding: 20 }}>
        {isSignedIn && <div>{navigate("/")}</div>}
        {isLoginError && (
          <div className="alert alert-danger mb-3 p-1">
            <p className="mb-0">{loginError}</p>
          </div>
        )}
        <h2 className="mb-4 center-text">Sign In</h2>
        <form action="">
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username/Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              value={input.username}
              onChange={onInputChange}
              onBlur={validateInput}
            />
            {error.username && <span className="err">{error.username}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={input.password}
              onChange={onInputChange}
              onBlur={validateInput}
            />
            {error.password && <span className="err">{error.password}</span>}
          </div>
          <Form.Check
            type={"checkbox"}
            id={`default-checkbox`}
            label={`Remember me`}
            className="mb-4 "
            onChange={(event) => {
              setIsUserRemembered(event.target.checked);
            }}
          />
          <div className="d-flex justify-content-evenly width:100% mb-4">
            <button
              className="btn btn-primary sign-in-btn"
              type="button"
              disabled={isLoading}
              onClick={() => {
                setError({ username: "", password: "" });
                setInputError(false);

                if (input.username.trim() === "") {
                  setInputError(true);
                  const username = "Username/Email is required.";
                  setError({ ...error, username });
                  return;
                }

                if (input.password.trim() === "") {
                  setInputError(true);
                  const password = "Password is required.";
                  setError({ ...error, password });
                  return;
                }
                setInputError(false);

                login(input, navigate);
              }}
            >
              {isLoading ? "loading..." : "Sign In"}
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={navigateForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          <div className="d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={navigateRegister}
            >
              Not registered? Register here
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SignIn;
