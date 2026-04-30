import { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { useNavigate } from "react-router-dom";
import { Button, MenuItem } from "@mui/material";
import { getToken } from "../../../hooks/auth";
import NoPage from "../../NoPage";
import { checkIfSignedIn } from "../../../hooks/auth";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const AdminRooms = () => {
  const token = `Bearer ${getToken()}`;
  const [roomsList, setRoomsList] = useState([]);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let { isSignedIn, isAdmin } = checkIfSignedIn();

  useEffect(() => {
  }, [roomsList]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${backend}/admingetrooms`, {
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
          setRoomsList(data.details);
        } else {
          setErrorMessage([data.errMsg]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  const navigate = useNavigate();
  const columns = useMemo(
    () => [
      {
        accessorKey: "roomName",
        header: "Room Name",
        filterVariant: "text",
        size: 100,
      },
      {
        accessorKey: "shortDesc",
        header: "Room Short Description",
        filterVariant: "text",
        size: 100,
      },
      {
        accessorKey: "basePrice",
        header: "Base Price",
        filterVariant: "text",
        size: 50,
      },
      {
        accessorKey: "maxPax",
        header: "Maximum number of guests",
        filterVariant: "text",
        size: 50,
      },
      {
        accessorKey: "dspPriority",
        header: "Display priority",
        filterVariant: "text",
        size: 50,
      },
    ],
    []
  );

  const handleDeleteRoom = (roomId) => {
    let newList = [...roomsList];
    let index = newList.findIndex((i) => i.roomId === roomId);
    if (
      confirm(
        `Delete ${newList[index].roomName}?\nPlease click on OK if you wish to proceed.`
      )
    ) {
      fetch(`${backend}/admindeleteroom/${newList[index].roomId}`, {
        method: "DELETE",
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
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
      newList.splice(index, 1);
      setRoomsList(newList);
    } else {
      console.log("Deletion cancelled");
    }
  };

  const handleGotoMntPage = (action, roomId) => {
    if (action === "CREATION") {
      navigate("/admincreateroom");
    } else {
      navigate("/adminupdateroom/" + roomId);
    }
  };

  return (
    <div>
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
            data={roomsList}
            enableFacetedValues
            initialState={{ showColumnFilters: true }}
            enableRowActions
            renderRowActionMenuItems={({ row }) => [
              <MenuItem
                key="edit"
                onClick={() => handleGotoMntPage("EDIT", row.original.roomId)}
              >
                Edit
              </MenuItem>,
              <MenuItem
                key="delete"
                onClick={() => handleDeleteRoom(row.original.roomId)}
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
                CREATE ROOM
              </Button>
            )}
          />
        </>
      )}
    </div>
  );
};

export default AdminRooms;
