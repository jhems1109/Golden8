import { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Button, MenuItem } from "@mui/material";
import { getToken, checkIfSignedIn } from "../../hooks/auth";
import NoPage from "../NoPage";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const AdminUsers = () => {
  const token = `Bearer ${getToken()}`;
  const [pageName, setPageName] = useState("Home");
  const [roomUpd, setRoomUpd] = useState(false);
  const [roomsList, setRoomsList] = useState([]);
  const [photosList, setPhotosList] = useState([]);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let { isSignedIn } = checkIfSignedIn();

  useEffect(() => {
    setErrorMessage([]);
    const url = window.location.pathname;
    setIsLoading(true);
    if (url != "/photosrooms") {
      setRoomUpd(false);
      if (url === "/photoshome") {
        setPageName("Home");
      } else if (url === "/photosamenities") {
        setPageName("Amenities");
      } else if (url === "/photosactivities") {
        setPageName("Activities");
      }
      fetch(`${backend}${url}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "Application/JSON",
          Authorization: token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.requestStatus === "ACTC") {
            setPhotosList(data.details);
          } else {
            setErrorMessage([data.errMsg]);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      setRoomUpd(true);
      setPageName("");
      fetch(`${backend}/rooms`)
        .then((response) => response.json())
        .then((data) => {
          if (data.requestStatus === "ACTC") {
            setRoomsList(data.details);
          } else {
            setErrorMessage([data.errMsg]);
          }
          setIsLoading(false);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, [location.pathname]);

  const handleRoomChosen = (e) => {
    setPageName(e.target.value);
    setIsLoading(true);
    const url = `/photosrooms?roomname=${e.target.value}`;
    fetch(`${backend}${url}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "Application/JSON",
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.requestStatus === "ACTC") {
          setPhotosList(data.details);
        } else {
          setErrorMessage([data.errMsg]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => `${backend}${row.pathName}`,
        header: "Image",
        size: 50,
        // Custom cell rendering for the image
        Cell: ({ renderedCellValue }) => (
          <img
            alt="Image"
            src={renderedCellValue}
            style={{
              height: 50,
              width: 50,
              objectFit: "cover",
            }}
          />
        ),
      },
      {
        accessorKey: "imageDesc",
        header: "Description",
        filterVariant: "text",
        size: 100,
      },
      {
        accessorKey: "dspPriority",
        header: "Display Priority",
        filterVariant: "text",
        size: 50,
      },
    ],
    [],
  );

  const handleDeletePhoto = (photoId) => {
    let newList = [...photosList];
    let index = newList.findIndex((i) => i.photoId === photoId);
    let data = newList[index];
    if (confirm(`Delete image?\nPlease click on OK if you wish to proceed.`)) {
      fetch(`${backend}/photodelete/${newList[index].photoId}`, {
        method: "DELETE",
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
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
      newList.splice(index, 1);
      setPhotosList(newList);
    } else {
      console.log("Deletion cancelled");
    }
  };

  const handleGotoMntPage = (action, photoId) => {
    if (action === "CREATION") {
      navigate("/photocreate?pageName=" + pageName);
    } else {
      navigate("/photoupdate/" + photoId);
    }
  };

  return (
    <div>
      {!isSignedIn ? (
        <div>
          <NoPage />
        </div>
      ) : isLoading ? (
        <div className="loading-overlay">
          <div style={{ color: "black" }}>Loading...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div>
          {roomUpd && (
            <div>
              <br></br>
              <br></br>
              <select
                id="roomName"
                name="roomName"
                type="text"
                className="form-control"
                value={pageName}
                onChange={handleRoomChosen}
              >
                {roomsList.map((option, index) => (
                  <option value={option.roomName} key={index}>
                    {option.roomName}
                  </option>
                ))}
              </select>
              <br></br>
            </div>
          )}
          {pageName !== "" && (
          <>
            {errorMessage.length > 0 && (
              <div className="alert alert-danger mb-3 p-1">
                {errorMessage.map((err, index) => (
                  <p className="mb-0" key={index}>
                    {err}
                  </p>
                ))}
              </div>
            )}
            <MaterialReactTable
              columns={columns}
              data={photosList}
              enableFacetedValues
              initialState={{ showColumnFilters: true }}
              enableRowActions
              renderRowActionMenuItems={({ row }) => [
                <MenuItem
                  key="edit"
                  onClick={() =>
                    handleGotoMntPage("EDIT", row.original.photoId)
                  }
                >
                  Edit
                </MenuItem>,
                <MenuItem
                  key="delete"
                  onClick={() => handleDeletePhoto(row.original.photoId)}
                >
                  Delete
                </MenuItem>,
              ]}
              renderTopToolbarCustomActions={({ table }) => (
                <Button
                  color="success"
                  onClick={() => handleGotoMntPage("CREATION", "")}
                  variant="contained"
                  size="sm"
                >
                  ADD PHOTO
                </Button>
              )}
            />
          </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
