import { useNavigate } from "react-router-dom";

const NoPage = () => {
  const navigate = useNavigate();
  const navigateHome = () => {
    navigate("/"), { state: { fromPage: "NoPage" } };
  };

  return (
    <>
      <div
        className="d-flex justify-content-center vh-100"
        style={{ paddingTop: "10rem" }}
      >
        <div className="text-center">
          <h1 className="display-1 fw-bold">404</h1>
          <p className="fs-3">
            {" "}
            <span className="text-danger">Opps!</span> Page not found.
          </p>
          <p className="lead">The page you’re looking for doesn’t exist.</p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: "#116466" }}
            onClick={navigateHome}
          >
            Go Back to Homepage
          </button>
        </div>
      </div>
    </>
  );
};

export default NoPage;
