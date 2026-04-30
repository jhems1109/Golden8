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

const AdminSystemParameters = () => {
  const token = `Bearer ${getToken()}`;
  const [parametersList, setParametersList] = useState([]);
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const canBeDeletedParms = [
    "sport",
    "statistic",
    "position",
    "notification_type",
  ];
  let { isSignedIn, isAdmin } = checkIfSignedIn();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${backend}/admingetparms`, {
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
          let parmList = data.details.map((parm) => {
            let preview = "";
            if (parm.parameterId === "login") {
              preview = JSON.stringify(parm.login);
            } else if (parm.parameterId === "notification_type") {
              preview = JSON.stringify(parm.notification_type);
            }
            return { parmId: parm._id, parameterId: parm.parameterId, preview };
          });
          setParametersList(parmList);
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
        accessorKey: "parmId",
        header: "Parameter Id",
        filterVariant: "text",
        size: 50,
      },
      {
        accessorKey: "parameterId",
        header: "Parameter Type",
        filterVariant: "select",
        size: 30,
      },
      {
        accessorKey: "preview",
        header: "Parameter Value (Preview)",
        filterVariant: "text",
        size: 150,
      },
    ],
    []
  );

  const handleDeleteParameter = (parmId) => {
    let newList = [...parametersList];
    let index = newList.findIndex((i) => i.parmId === parmId);
    let parmTypeDelete = newList[index].parameterId;
    if (!canBeDeletedParms.find((parm) => parm === parmTypeDelete)) {
      alert("Cannot delete this type of parameter.");
    } else {
      if (
        confirm(
          `Delete ${newList[index].parmId}?\nPlease click on OK if you wish to proceed.`
        )
      ) {
        fetch(`${backend}/admindeleteparm/${newList[index].parmId}`, {
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
        setParametersList(newList);
      } else {
        console.log("Deletion cancelled");
      }
    }
  };

  const handleGotoMntPage = (action, parmId) => {
    if (action === "CREATION") {
      navigate("/admincreateparm");
    } else {
      navigate("/adminupdateparm/" + parmId);
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
            data={parametersList}
            enableFacetedValues
            initialState={{ showColumnFilters: true }}
            enableRowActions
            renderRowActionMenuItems={({ row }) => [
              <MenuItem
                key="edit"
                onClick={() => handleGotoMntPage("EDIT", row.original.parmId)}
              >
                Edit
              </MenuItem>,
              <MenuItem
                key="delete"
                onClick={() => handleDeleteParameter(row.original.parmId)}
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
                CREATE PARAMETER
              </Button>
            )}
          />
        </>
      )}
    </div>
  );
};

export default AdminSystemParameters;
