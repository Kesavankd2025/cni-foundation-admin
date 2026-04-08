import { useState, useEffect } from "react";
import LoginApi from "../Api/LoginApi";

let permissionsCache = null;
let userTypeCache = "";
let isFetching = false;
let subscribers = [];

const usePermissions = () => {
  const [permissions, setPermissions] = useState(permissionsCache || []);
  const [userType, setUserType] = useState(userTypeCache || "");
  const [loading, setLoading] = useState(!permissionsCache);

  useEffect(() => {
    if (permissionsCache) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      if (isFetching) {
        subscribers.push({ setPermissions, setUserType, setLoading });
        return;
      }

      isFetching = true;
      try {
        const result = await LoginApi.getRolesAndPermissions();
        if (result.status) {
          userTypeCache = result.response.data.userType;
          permissionsCache = result.response.data.permissions || [];
          setUserType(userTypeCache);
          setPermissions(permissionsCache);

          subscribers.forEach((sub) => {
            sub.setUserType(userTypeCache);
            sub.setPermissions(permissionsCache);
            sub.setLoading(false);
          });
          subscribers = [];
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
        isFetching = false;
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (moduleName, action = "view") => {
    if (loading) return false;
    if (userType === "ADMIN") return true;
    const module = permissions.find((perm) => perm.moduleName === moduleName);
    return module?.actions?.[action] || false;
  };

  return { hasPermission, userType, loading };
};

export default usePermissions;
