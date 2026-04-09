import { useState, useEffect } from "react";

const usePermissions = () => {
  const hasPermission = (moduleName, action = "view") => {
    return true;
  };

  return { hasPermission, userType: "ADMIN", loading: false };
};

export default usePermissions;
