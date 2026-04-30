import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import loginService from "../services/authService";
import axios from "axios";

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [isSignedIn, setSignedIn] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginError, setIsLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [otpError, setOTPError] = useState(false);
  const [otpErrorMessage, setOTPErrorMessage] = useState("");
  const [responseToken, setResponseToken] = useState("");
  const [isUserRemembered, setIsUserRemembered] = useState(false);
  const [istrue, setItrue] = useState(false);

  // this useeffect runs each time the value of isSignedIn changes
  useEffect(() => {
    getUserFromLocalStorage();
  }, [isSignedIn]);

  useEffect(() => {
    setItrue(false);
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("rememberuser");
    if (isSignedIn && data === true) {
      sessionStorage.setItem("rememberuser", true);
      localStorage.setItem("rememberuser", true);
    } else {
      localStorage.removeItem("rememberuser");
      sessionStorage.setItem("rememberuser", false);
    }

    // }
  }, [sessionStorage]);

  useEffect(() => {
    window.addEventListener("beforeunload", async () => {
      if (sessionStorage.getItem("rememberuser") != null) {
        console.log("page was reloaded");
      } else {
        const rememberUser = await localStorage.getItem("rememberuser");

        if (rememberUser === null) {
          await signOut();
        }
      }
    });
  });

  const tokenCheck =
    responseToken === "" ||
    responseToken === null ||
    responseToken === undefined;

  useEffect(() => {
    getTokenFromLocalStorage();
  }, [tokenCheck]);

  return (
    <AuthContext.Provider
      value={{
        signOut,
        isSignedIn,
        isAdmin,
        login,
        registerUser,
        loginError,
        isLoginError,
        isLoading,
        verifyOTP,
        otpError,
        setOTPError,
        otpErrorMessage,
        registrationError,
        setOTPErrorMessage,
        forgotPassword,
        forgotPasswordError,
        responseToken,
        resetPassword,
        resetPasswordError,
        setIsUserRemembered,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  async function updateHTTPHeaders(token) {
    const commons = axios.defaults.headers.common;
    if (token) {
      commons["Authorization"] = `Bearer ${token}`;
    }
  }

  async function login(input, navigate) {
    const { username: email, password } = input;
    try {
      setIsLoading(true);
      setItrue(true);
      const resp = await loginService.login(email, password);
      if (resp.data) {
        setIsLoading(false);
        const { requestStatus, token } = resp.data;
        if (requestStatus === "ACTC") {
          updateHTTPHeaders(token);
          setResponseToken(token);
          await localStorage.setItem("token", JSON.stringify(token));
          const { user } = resp.data;
          setSignedIn(true);
          if (isUserRemembered) {
            localStorage.setItem("rememberuser", true);
          }
          if (user.userType === "USER") {
            navigate("/");
            setAdmin(false);
            await localStorage.setItem("login", JSON.stringify(user));
          } else if (user.userType === "ADMIN") {
            setAdmin(true);
            const adminObject = {
              name: "ADMIN",
              admin: true,
            };
            await localStorage.setItem("login", JSON.stringify(adminObject));
            navigate("/adminusers");
          }
        } else if (requestStatus === "RJCT") {
          setSignedIn(false);
          setAdmin(false);
          setIsLoginError(true);
          const { message } = resp.data;
          setLoginError(message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function registerUser(currentValues, navigate) {
    try {
      const response = await loginService.registerUser(currentValues);
      if (response) {
        const { requestStatus } = response.data;
        if (requestStatus === "RJCT") {
          setRegistrationError(response.data.errMsg);
        } else {
          await localStorage.setItem("otp", JSON.stringify(response.data.user));
          navigate("/inputotp", { state: { fromPage: "Register" } });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function verifyOTP(otp, nextPage, navigate) {
    try {
      let user = await JSON.parse(localStorage.getItem("otp"));
      const email = user.email;
      const data = { email, otp };
      const response = await loginService.verifyOTP(data);
      if (response.data) {
        const { requestStatus, token } = response.data;
        // setting the token in the headers for every request
        updateHTTPHeaders(token);
        if (requestStatus === "ACTC" && nextPage === "/") {
          await localStorage.setItem("login", JSON.stringify(user.userName));
          await localStorage.setItem("token", JSON.stringify(token));
          await localStorage.removeItem("otp");
          setSignedIn(true);
          navigate("/");
        } else if (requestStatus === "ACTC" && nextPage === "/resetpassword") {
          let store = { email, otp };
          localStorage.setItem("otp", JSON.stringify(store));
          navigate("/resetpassword");
        } else {
          setOTPError(true);
          setOTPErrorMessage(response.data.message);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // retrieving the data from the local storage
  async function getUserFromLocalStorage() {
    const user = await localStorage.getItem("login");
    const parsedUserData = JSON.parse(user);
    if (parsedUserData) {
      setAdmin(parsedUserData.admin);
      setSignedIn(true);
    }
  }

  async function getTokenFromLocalStorage() {
    const data = await localStorage.getItem("token");
    const parsedData = JSON.parse(data);
    if (parsedData) {
      const payload = JSON.parse(atob(data.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;         // exp is in seconds, Date.now() is ms
      if (isExpired) {
        await signOut();
      } else {
        setResponseToken(parsedData);
      }
    }
  }

  async function signOut() {
    setSignedIn(false);
    setAdmin(false);
    delete axios.defaults.headers.common["Authorization"];
    await localStorage.clear();
    await sessionStorage.clear();
  }

  async function forgotPassword(email, navigate) {
    if (email === "") {
      setForgotPasswordError("Email address is required");
      navigate("/forgotpassword");
    } else {
      try {
        let store = { email };
        await localStorage.setItem("otp", JSON.stringify(store));
        const res = await loginService.forgotPassword(email);
        if (res.data) {
          await navigate("/inputotp", {
            state: { fromPage: "ForgotPassword" },
          });
        }
        if (res) {
          const { requestStatus } = res.data;
          if (requestStatus === "RJCT") {
            setForgotPasswordError(res.data.errMsg);
            navigate("/forgotpassword");
          } else {
            navigate("/inputotp", { state: { fromPage: "ForgotPassword" } });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function resetPassword(newPassword, confirmNewPassword, navigate) {
    try {
      const data = await localStorage.getItem("otp");

      const { email, otp } = JSON.parse(data);
      const res = await loginService.resetPassword(
        newPassword,
        confirmNewPassword,
        email,
        otp
      );
      if (res) {
        const { requestStatus } = res.data;
        if (requestStatus === "RJCT") {
          setResetPasswordError(res.data.errMsg);
          navigate("/resetpassword");
        } else {
          await localStorage.removeItem("otp");
          navigate("/signin");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
};

AuthContext.ProviderWrapper = AuthContextProvider;

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
