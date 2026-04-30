import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {checkIfSignedIn, getToken} from "../hooks/auth";

const backend = import.meta.env.MODE === "development" ? "http://localhost:8000" : "https://golden8.onrender.com";

const NotificationContext = createContext({});
const token = `Bearer ${getToken()}`
let { isSignedIn } = checkIfSignedIn()

const NotificationContextProvider = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isSignedIn) {
      fetch(`${backend}/notifunreadcount`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "Application/JSON",
            "Authorization": token
        }
      })
      .then(response => response.json())
      .then(data => {
        setNotificationCount(data)
      })
    }
  }, []);



  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

NotificationContext.ProviderWrapper = NotificationContextProvider;

NotificationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationContext;
