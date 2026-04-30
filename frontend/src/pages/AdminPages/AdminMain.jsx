import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminUsers from "./TabPages/AdminUsers";
import AdminSystemParameters from "./TabPages/AdminSystemParameters";
import AdminRooms from "./TabPages/AdminRooms";
import NoPage from "../NoPage";
import { checkIfSignedIn } from "../../hooks/auth";

const AdminMain = () => {
  const [activeTab, setActiveTab] = useState("");
  let { isSignedIn, isAdmin } = checkIfSignedIn();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const url = window.location.pathname;
    if (url === "/adminusers") {
      setActiveTab("tab1");
    } else if (url === "/adminrooms") {
      setActiveTab("tab2");
    } else if (url === "/adminsystemparameters") {
      setActiveTab("tab3");
    }
  }, [location.pathname]);

  const navigateTabs = (tabNum) => {
    if (tabNum === "tab1") {
      navigate("/adminusers");
    } else if (tabNum === "tab2") {
      navigate("/adminrooms");
    } else if (tabNum === "tab3") {
      navigate("/adminsystemparameters");
    }
  };

  return (
    <div className="d-flex container mt-2 justify-content-center">
      {!isSignedIn || !isAdmin ? (
        <div>
          <NoPage />
        </div>
      ) : (
        <div>
          <ul className="nav nav-tabs mt-2">
            <li
              className={
                activeTab === "tab1"
                  ? "nav-link active fw-bold text-primary"
                  : "nav-link text-secondary"
              }
              onClick={() => navigateTabs("tab1")}
            >
              Users
            </li>
            <li
              className={
                activeTab === "tab2"
                  ? "nav-link active fw-bold text-primary"
                  : "nav-link text-secondary"
              }
              onClick={() => navigateTabs("tab2")}
            >
              Rooms
            </li>
            <li
              className={
                activeTab === "tab3"
                  ? "nav-link active fw-bold text-primary"
                  : "nav-link text-secondary"
              }
              onClick={() => navigateTabs("tab3")}
            >
              Parameters
            </li>
          </ul>
          <div className="outlet">
            {activeTab === "tab1" ? (
              <AdminUsers />
            ) : activeTab === "tab2" ? (
              <AdminRooms />
            ) : (
              <AdminSystemParameters />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMain;
