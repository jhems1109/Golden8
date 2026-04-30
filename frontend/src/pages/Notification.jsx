import { useState, useEffect } from "react";
import {
  BiEnvelopeOpen,
  BiEnvelope,
  BiChevronLeft,
  BiChevronRight,
} from "react-icons/bi";
import useAuth, { checkIfSignedIn, getToken } from "../hooks/auth";
import useNotification from "../hooks/notification";
import { useNavigate } from "react-router-dom";
import "../App.css";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const Notification = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { setNotificationCount } = useNotification();
  const token = `Bearer ${getToken()}`;
  const checkIfUserIsSignedIn = () => {
    let user = checkIfSignedIn();
    if (!user.isSignedIn) {
      navigate("/signin");
    }
  };

  const [selectedStates, setSelectedStates] = useState(Array(20).fill(false));
  const [envelopeOpen, setEnvelopeOpen] = useState(Array(20).fill(false));
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    const startTime = new Date();

    try {
      const response = await fetch(`${backend}/notifications`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "Application/JSON",
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.requestStatus === "ACTC") {
        setNotifications(data.details);
        setEnvelopeOpen(
          data.details.map((notification) => notification.readStatus)
        );
      } else {
        console.log(data.errMsg);
      }
    } catch (error) {
      console.error("Error fetching top leagues data:", error);
    } finally {
      const endTime = new Date(); // Record the end time
      const elapsedTimeInSeconds = (endTime - startTime) / 1000; // Calculate time difference in seconds
      console.log(`Response time: ${elapsedTimeInSeconds} seconds`);

      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    //console.log(JSON.stringify(envelopeOpen));
  }, [envelopeOpen]);

  const notificationsPerPage = 5;

  const toggleEnvelope = async (index) => {
    const updatedEnvelopeStates = [...envelopeOpen];
    updatedEnvelopeStates[index] = !updatedEnvelopeStates[index];
    setEnvelopeOpen(updatedEnvelopeStates);
    let unreadCount = updatedEnvelopeStates.reduce(
      (count, notif) => count + (notif === false),
      0
    );
    setNotificationCount(unreadCount);

    const updatedSelectedStates = [...selectedStates];
    updatedSelectedStates[index] = updatedEnvelopeStates[index];
    setSelectedStates(updatedSelectedStates);

    let updatedNotifications = [...notifications];
    updatedNotifications[index].readStatus =
      !updatedNotifications[index].readStatus;
    setNotifications(updatedNotifications);
    try {
      await fetch(
        `${backend}/notificationsread/${notifications[index].notifId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const handleApproveClick = (notification, index) => {
    const confirmed = window.confirm(
      "Please confirm that you want to approve request."
    );
    if (confirmed) {
      try {
        fetch(`${backend}/approverequest/${notification.notifId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.requestStatus === "ACTC") {
              let updatedNotifications = [...notifications];
              updatedNotifications[index].enableApproveButton = false;
              updatedNotifications[index].displayApproveButton = true;
              if (updatedNotifications[index].enableRejectButton === true) {
                updatedNotifications[index].enableRejectButton = false;
                updatedNotifications[index].displayRejectButton = true;
              }
              setNotifications([...updatedNotifications]);
            } else {
              console.log(data.errMsg);
            }
          });
      } catch (error) {
        console.error("Error marking notification as approved:", error);
      }
    }
  };

  const handleRejectClick = (notification, index) => {
    const confirmed = window.confirm(
      "Please confirm that you want to reject request."
    );

    if (confirmed) {
      try {
        fetch(`${backend}/rejectrequest/${notification.notifId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.requestStatus === "ACTC") {
              let updatedNotifications = [...notifications];
              updatedNotifications[index].enableApproveButton = false;
              updatedNotifications[index].displayApproveButton = true;
              updatedNotifications[index].enableRejectButton = false;
              updatedNotifications[index].displayRejectButton = true;
              setNotifications([...updatedNotifications]);
            } else {
              console.log(data.errMsg);
            }
          });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  return (
    <>
      {!isSignedIn && <div>{checkIfUserIsSignedIn()}</div>}
      {isLoading ? (
        <div className="loading-overlay">
          <div>Loading...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <section className="section-50">
          <div className="container">
            <h1 className="m-b-50 heading-line">Notifications</h1>

            <hr />

            <div className="notification-ui_dd-content">
              {notifications
                .slice(
                  (currentPage - 1) * notificationsPerPage,
                  currentPage * notificationsPerPage
                )
                .map((notification, index) => (
                  <div
                    key={index}
                    className={`notification-list notification-list--unread ${
                      selectedStates[index] ? "selected" : ""
                    }`}
                  >
                    <div className="notification-list_content">
                      <div className="notification-list_img">
                        <button
                          className="icon-button"
                          onClick={() => toggleEnvelope(index)}
                        >
                          {envelopeOpen[index] ? (
                            <BiEnvelope size={25} />
                          ) : (
                            <BiEnvelopeOpen size={25} />
                          )}
                        </button>
                      </div>
                      <div className="text-muted">
                        <p
                          className={`notification-message ${
                            notification.readStatus ? "" : "bold"
                          }`}
                        >
                          {notification.readStatus ? (
                            notification.message
                          ) : (
                            <b>{notification.message}</b>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="notifcation-list_feature-img">
                      {notification.enableApproveButton ? (
                        <button
                          className="approval-button"
                          onClick={() =>
                            handleApproveClick(notification, index)
                          }
                        >
                          Approve
                        </button>
                      ) : notification.displayApproveButton ? (
                        <button className="approval-button disabled">
                          Approve
                        </button>
                      ) : null}

                      {notification.enableRejectButton ? (
                        <button
                          className="decline-button"
                          onClick={() => handleRejectClick(notification, index)}
                        >
                          Reject
                        </button>
                      ) : notification.displayRejectButton ? (
                        <button className={`decline-button disabled`}>
                          Reject
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className={`pagination-button ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <BiChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`pagination-button ${
                      i + 1 === currentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={`pagination-button ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <BiChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default Notification;
