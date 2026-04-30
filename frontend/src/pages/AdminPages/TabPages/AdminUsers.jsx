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

const AdminUsers = () => {
  const token = `Bearer ${getToken()}`;
  const [usersList, setUsersList] = useState([]);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let { isSignedIn, isAdmin } = checkIfSignedIn();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${backend}/admingetusers`, {
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
          setUsersList(data.details);
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
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        size: 50,
      },
      {
        accessorKey: "userName",
        header: "Username",
        filterVariant: "text",
        size: 50,
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        filterVariant: "text",
        size: 100,
      },
      {
        accessorKey: "email",
        header: "Email Address",
        filterVariant: "text",
        size: 100,
      },
      {
        accessorKey: "userType",
        header: "Role",
        filterVariant: "select",
        size: 50,
      },
    ],
    []
  );

  const handleDeleteUser = (userId) => {
    let newList = [...usersList];
    let index = newList.findIndex((i) => i.userId === userId);
    if (
      confirm(
        `Delete ${newList[index].fullName}?\nPlease click on OK if you wish to proceed.`
      )
    ) {
      fetch(`${backend}/admindeleteuser/${newList[index].userId}`, {
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
      setUsersList(newList);
    } else {
      console.log("Deletion cancelled");
    }
  };

  const handleGotoMntPage = (action, userId) => {
    if (action === "CREATION") {
      navigate("/admincreateuser");
    } else {
      navigate("/adminupdateuser/" + userId);
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
            data={usersList}
            enableFacetedValues
            initialState={{ showColumnFilters: true }}
            enableRowActions
            renderRowActionMenuItems={({ row }) => [
              <MenuItem
                key="edit"
                onClick={() => handleGotoMntPage("EDIT", row.original.userId)}
              >
                Edit
              </MenuItem>,
              <MenuItem
                key="delete"
                onClick={() => handleDeleteUser(row.original.userId)}
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
                CREATE USER ACCOUNT
              </Button>
            )}
          />
        </>
      )}
    </div>
  );
};

export default AdminUsers;
