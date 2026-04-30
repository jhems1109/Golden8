import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PhotosLists from "./PhotosLists";
import NoPage from "../NoPage";
import { checkIfSignedIn } from "../../hooks/auth";

const PhotoPage = () => {
  const [activeTab, setActiveTab] = useState("");
  let { isSignedIn } = checkIfSignedIn();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const url = window.location.pathname;
    if (url === "/photoshome") {
      setActiveTab("tab1");
    } else if (url === "/photosamenities") {
      setActiveTab("tab2");
    } else if (url === "/photosactivities") {
      setActiveTab("tab3");
    } else if (url === "/photosrooms") {
      setActiveTab("tab4");
    }
  }, [location.pathname]);

  const navigateTabs = (tabNum) => {
    if (tabNum === "tab1") {
      navigate("/photoshome");
    } else if (tabNum === "tab2") {
      navigate("/photosamenities");
    } else if (tabNum === "tab3") {
      navigate("/photosactivities");
    } else if (tabNum === "tab4") {
      navigate("/photosrooms");
    }
  };

  return (
    <div className="d-flex container mt-2 justify-content-center">
      {!isSignedIn ? (
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
              Home
            </li>
            <li
              className={
                activeTab === "tab2"
                  ? "nav-link active fw-bold text-primary"
                  : "nav-link text-secondary"
              }
              onClick={() => navigateTabs("tab2")}
            >
              Amenities
            </li>
            <li
              className={
                activeTab === "tab3"
                  ? "nav-link active fw-bold text-primary"
                  : "nav-link text-secondary"
              }
              onClick={() => navigateTabs("tab3")}
            >
              Activities
            </li>
            <li
              className={
                activeTab === "tab4"
                  ? "nav-link active fw-bold text-primary"
                  : "nav-link text-secondary"
              }
              onClick={() => navigateTabs("tab4")}
            >
              Rooms
            </li>
          </ul>
          <div className="outlet">
            <PhotosLists />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPage;
