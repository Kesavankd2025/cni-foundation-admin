import React from "react";
import { Link } from "react-router-dom";

const AccessDeniedLayer = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
      <div className="text-center">
        <Link to="/">
          <img
            src="assets/images/logo1.png"
            alt="CNI Forum"
            style={{ maxWidth: "250px", width: "100%", height: "auto", objectFit: "contain" }}
          />
        </Link>
        <h5 className="mt-4 text-secondary-light">Access Denied</h5>
        <p className="text-secondary-light">You don't have access to view this page</p>
        <Link
          to="/"
          className="btn btn-primary radius-8 px-20 py-11 d-inline-flex align-items-center gap-2 mt-4"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedLayer;
