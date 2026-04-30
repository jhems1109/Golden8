import { useState, useEffect, useRef } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate, useParams } from "react-router-dom";
import { FaSearchPlus } from "react-icons/fa";
import { checkIfSignedIn, getToken } from "../../hooks/auth";
import NoPage from "../NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const AdminRoomMnt = () => {
  let { isSignedIn, isAdmin } = checkIfSignedIn();
  const token = `Bearer ${getToken()}`;
  const inputFileBanner = useRef(null);
  const inputFileLogo = useRef(null);
  const routeParams = useParams();
  const [action, handleAction] = useState("");
  const [currValues, setCurrentValues] = useState({
    roomName: "",
    shortDesc: "",
    description: "",
    basePrice: "",
    maxPax: 1,
    dspPriority: 99,
    newCreatorId: null,
  });
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoURL, setLogoURL] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerURL, setBannerURL] = useState(null);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = window.location.pathname;
    if (url === "/admincreateroom") {
      handleAction({
        type: "Creation",
        title: "CREATE ROOM",
        button1: "Create Room",
      });
      setIsLoading(false);
    } else {
      handleAction({ type: "Update", title: "UPDATE ROOM", button1: "Update" });
      fetch(`${backend}/admingetroomdetails/${routeParams.roomid}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "Application/JSON",
          Authorization: token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.requestStatus === "RJCT") {
            setErrorMessage([data.errMsg]);
          } else {
            setCurrentValues({
              roomName: data.details.roomName,
              shortDesc: data.details.shortDesc,
              description: data.details.description,
              basePrice: data.details.basePrice,
              maxPax: data.details.maxPax,
              dspPriority: data.details.dspPriority,
              createdBy: data.details.createdBy,
              createdAt: data.details.createdAt,
              updatedAt: data.details.updatedAt,
            });
            fetch(`${backend}/logos/${routeParams.roomid}.jpeg`).then((res) => {
              if (res.ok) {
                setLogoURL(`${backend}/logos/${routeParams.roomid}.jpeg`);
                setSelectedLogo("x");
              }
            });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, [location.pathname]);

  const handleLogoChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedLogo(event.target.files[0]);
      setLogoURL(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleBannerChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedBanner(event.target.files[0]);
      setBannerURL(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleRoomDetails = (e) => {
    const field = e.target.name;
    setCurrentValues({ ...currValues, [field]: e.target.value });
  };

  const navigate = useNavigate();
  const navigateCreateUpdate = () => {
    let data = { ...currValues };
    setIsLoading(true);
    if (action.type === "Creation") {
      //data.logo = selectedLogo
      //data.banner = selectedBanner
      fetch(`${backend}/admincreateroom`, {
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
          } else {
            navigate("/adminrooms");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      //data.logo = selectedLogo
      //data.banner = selectedBanner
      fetch(`${backend}/adminupdateroom/${routeParams.roomid}`, {
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
          } else {
            navigate("/adminrooms");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  };

  const navigateCancel = () => {
    navigate(-1);
  };

  return (
    <div className="d-flex container mt-2 justify-content-center">
      {!isSignedIn || !isAdmin ? (
        <div>
          <NoPage />
        </div>
      ) : isLoading ? (
        <div className="loading-overlay">
          <div style={{ color: "black" }}>Loading...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <Card style={{ width: "70rem", padding: 20 }}>
          {errorMessage.length > 0 && (
            <div className="alert alert-danger mb-3 p-1">
              {errorMessage.map((err, index) => (
                <p className="mb-0" key={index}>
                  {err}
                </p>
              ))}
            </div>
          )}
          <h2 className="mb-4 center-text">{action.title}</h2>
          <form action="" encType="multipart/form-data">
            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="roomName" className="form-label">
                  Room
                </label>
              </div>
              <div className="col-10">
                <textarea
                  id="roomName"
                  name="roomName"
                  className="form-control form-control-sm"
                  value={currValues.roomName}
                  onChange={handleRoomDetails}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="shortDesc" className="form-label">
                  Short Description
                </label>
              </div>
              <div className="col-10">
                <textarea
                  id="shortDesc"
                  name="shortDesc"
                  className="form-control form-control-sm"
                  value={currValues.shortDesc}
                  onChange={handleRoomDetails}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
              </div>
              <div className="col-10">
                <textarea
                  id="description"
                  name="description"
                  className="form-control form-control-sm"
                  value={currValues.description}
                  onChange={handleRoomDetails}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-2 text-end">
                <label htmlFor="basePrice" className="form-label">
                  Base Price
                </label>
              </div>
              <div className="col-4">
                <input
                  id="basePrice"
                  name="basePrice"
                  type="text"
                  className="form-control"
                  value={currValues.basePrice}
                  onChange={handleRoomDetails}
                />
              </div>
              <div className="col-2 text-end">
                <label htmlFor="maxPax" className="form-label">
                  Maximum number of guests
                </label>
              </div>
              <div className="col-4">
                <input
                  id="maxPax"
                  name="maxPax"
                  type="number"
                  min="1"
                  className="form-control"
                  value={currValues.maxPax}
                  onChange={handleRoomDetails}
                />
              </div>
              <div className="col-2 text-end">
                <label htmlFor="dspPriority" className="form-label">
                  Listing display priority
                </label>
              </div>
              <div className="col-4">
                <input
                  id="dspPriority"
                  name="dspPriority"
                  type="number"
                  min="1"
                  className="form-control"
                  value={currValues.dspPriority}
                  onChange={handleRoomDetails}
                />
              </div>
            </div>

            <div className="row">
              {action.type !== "Creation" && (
                <>
                  <p />
                  <div className="row mt-3">
                    <div className="col-3 text-end">
                      <label htmlFor="createdBy" className="form-label">
                        Created By :
                      </label>
                    </div>
                    <div className="col-3">
                      <a
                        href={`/adminupdateuser/${currValues.createdBy}`}
                        target="_blank"
                        rel="noreferrer"
                        name="createdBy"
                        className="col-10 mb-1"
                      >
                        {currValues.createdBy}
                      </a>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-3 text-end">
                      <label htmlFor="createdAt" className="form-label">
                        Date of Room Creation :
                      </label>
                    </div>
                    <div className="col-4">
                      <p className="form-label">{currValues.createdAt}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-3 text-end">
                      <label htmlFor="updatedAt" className="form-label">
                        Room Latest Update Date :
                      </label>
                    </div>
                    <div className="col-4">
                      <p className="form-label">{currValues.updatedAt}</p>
                    </div>
                  </div>
                </>
              )}
              <div className="row mt-2">
                <div className="col-3 text-end">
                  <label htmlFor="newCreatorId" className="form-label">
                    Change Room Creator :
                  </label>
                </div>
                <div className="col-3">
                  <input
                    id="newCreatorId"
                    name="newCreatorId"
                    type="text"
                    className="form-control"
                    value={currValues.newCreatorId}
                    onChange={handleRoomDetails}
                  />
                </div>
              </div>
            </div>

            <div className="row justify-content-center mt-3">
              <div className="col-sm-3 mb-3 text-center">
                <label htmlFor="logo" className="form-label">
                  Select Logo
                </label>
                {selectedLogo && (
                  <div>
                    <img
                      src={logoURL}
                      alt="not found"
                      className="rounded mw-100 mb-2 border border-secondary"
                      style={{ width: "100rem", height: "13rem" }}
                    />
                    <button
                      onClick={() => setSelectedLogo(null)}
                      className="btn btn-secondary mb-3 mx-1 btn-sm"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mb-3 btn-sm"
                      onClick={() => inputFileLogo.current.click()}
                    >
                      Replace
                    </button>
                  </div>
                )}
                {!selectedLogo && (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="rounded mw-100 mb-3 border border-secondary"
                      style={{ width: "100rem", height: "13rem" }}
                      viewBox="-12 -12 40 40"
                    >
                      <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                      <path d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z" />
                    </svg>
                    <button
                      type="button"
                      className="btn btn-secondary mb-3 btn-sm"
                      onClick={() => inputFileLogo.current.click()}
                    >
                      Upload
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  className="d-none"
                  onChange={handleLogoChange}
                  accept="image/*"
                  ref={inputFileLogo}
                />
              </div>
            </div>
          </form>
          <div className="row justify-content-center">
            <button
              className="btn btn-dark col-2 mx-5"
              type="button"
              onClick={navigateCreateUpdate}
            >
              {action.button1}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary col-2"
              onClick={navigateCancel}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminRoomMnt;
