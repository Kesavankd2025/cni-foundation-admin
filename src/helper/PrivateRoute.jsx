import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Bypassing token check
  return <Outlet />;
};

export default PrivateRoute;
