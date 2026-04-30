import { useContext } from "react";
import NotificationContext from "../context/notificationContext";

const useNotification = () => {
  const notification = useContext(NotificationContext);

  return notification;
};

export default useNotification;
