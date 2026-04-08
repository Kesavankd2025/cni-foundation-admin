import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import RoleApi from "../Api/RoleApi";
import usePermissions from "../hook/usePermissions";
import { formatErrorMessage } from "../helper/TextHelper";

const UserRoleFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    roleName: "",
    roleType: "",
    mobileAdminAccess: false,
    coreLeader: false,
  });

  const roleTypeOptions = [
    { value: "adminRoles", label: "Admin Role" },
    { value: "memberRoles", label: "Member Role" },
    { value: "chapterRoles", label: "Chapter Role" },
  ];
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const actions = [
    { id: "view", label: "View" },
    { id: "add", label: "Add" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ];


  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await RoleApi.getModules();
      if (response.status) {
        setModules(response.response.data || []);
        const initialPermissions = {};
        (response.response.data || []).forEach((module) => {
          initialPermissions[module._id] = {
            view: false,
            add: false,
            edit: false,
            delete: false,
          };
        });
        if (!isEditMode) {
          setPermissions(initialPermissions);
        }
        return initialPermissions;
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    if (isEditMode && modules.length > 0) {
      fetchRoleDetails();
    }
  }, [isEditMode, modules.length]);

  const fetchRoleDetails = async () => {
    setIsLoading(true);
    try {
      const response = await RoleApi.getRole(id);
      if (response.status) {
        const role = response.response.data;
        setFormData({
          roleName: role.name,
          roleType: role.roleType || "",
          mobileAdminAccess: role.mobileAdminAccess || false,
          coreLeader: role.coreLeader || false,
        });

        const newPermissions = {};
        modules.forEach((m) => {
          newPermissions[m._id] = {
            view: false,
            add: false,
            edit: false,
            delete: false,
          };
        });

        if (role.permissions) {
          role.permissions.forEach((perm) => {
            const modId =
              typeof perm.moduleId === "object"
                ? perm.moduleId._id
                : perm.moduleId;
            if (newPermissions[modId]) {
              newPermissions[modId] = {
                ...newPermissions[modId],
                ...perm.actions,
              };
            }
          });
        }
        setPermissions(newPermissions);
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = type === "checkbox" ? checked : value;
    if (name === "roleName") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear relevant errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const togglePermission = (moduleId, actionId) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [actionId]: !prev[moduleId]?.[actionId],
      },
    }));
    // Clear permission error
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: "" }));
    }
  };

  const isReportModule = (moduleName) => {
    if (!moduleName) return false;
    const name = moduleName.toLowerCase();
    // Renewal Report gets all permissions (view, add, edit, delete)
    if (name === "renewal report") return false;
    return name.includes("report");
  };

  const toggleColumn = (actionId) => {
    const eligibleModules = modules.filter(
      (m) => actionId === "view" || !isReportModule(m.name),
    );

    const allSelected = eligibleModules.every(
      (module) => permissions[module._id]?.[actionId],
    );

    setPermissions((prev) => {
      const newPermissions = { ...prev };
      modules.forEach((module) => {
        if (actionId !== "view" && isReportModule(module.name)) {
          return;
        }

        if (!newPermissions[module._id]) {
          newPermissions[module._id] = {
            view: false,
            add: false,
            edit: false,
            delete: false,
          };
        }
        newPermissions[module._id] = {
          ...newPermissions[module._id],
          [actionId]: !allSelected,
        };
      });
      return newPermissions;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roleName.trim()) {
      newErrors.roleName = formatErrorMessage("role name is required");
    }

    if (!formData.roleType) {
      newErrors.roleType = formatErrorMessage("role type is required");
    }
    if (formData.roleType === "adminRoles" || formData.roleType === "chapterRoles") {
      const hasAnyPermission = Object.values(permissions).some((actions) =>
        Object.values(actions).some((val) => val === true),
      );

      const isMobileAccessSelected = formData.mobileAdminAccess;

      if (!hasAnyPermission && !isMobileAccessSelected) {
        newErrors.permissions = formatErrorMessage(
          "at least one permission selection is required.",
        );
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    setIsLoading(true);

    const formattedPermissions = Object.entries(permissions).map(
      ([moduleId, actions]) => ({
        moduleId,
        actions,
      }),
    );

    const payload = {
      name: formData.roleName,
      permissions: formattedPermissions,
      roleType: formData.roleType,
      mobileAdminAccess: formData.mobileAdminAccess,
      coreLeader: formData.coreLeader,
    };

    if (isEditMode) payload.id = id;

    try {
      let response;
      if (isEditMode) {
        response = await RoleApi.updateRole(id, payload);
      } else {
        response = await RoleApi.createRole(payload);
      }

      if (response.status) {
        navigate("/user-roles");
      }
    } catch (error) {
      console.error("Error saving role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Role" : "Create Role"}
        </h6>
        {errors.permissions && (
          <div className="text-danger text-xs mt-1">
            {errors.permissions}
          </div>
        )}
      </div>
      <div className="card-body px-24 py-16">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3 mt-0 mb-4">
            <div className="row align-items-end mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Role Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control radius-8 ${errors.roleName ? "is-invalid" : ""}`}
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  placeholder="Enter Role Name"
                  disabled={isEditMode}
                />
                {errors.roleName && (
                  <div className="text-danger text-xs mt-1">
                    {errors.roleName}
                  </div>
                )}
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Role Type <span className="text-danger">*</span>
                </label>
                <Select
                  options={roleTypeOptions}
                  value={roleTypeOptions.find((opt) => opt.value === formData.roleType) || null}
                  onChange={(option) => {
                    const newRoleType = option ? option.value : "";
                    setFormData(prev => ({
                      ...prev,
                      roleType: newRoleType,
                      mobileAdminAccess: newRoleType === "chapterRoles" ? prev.mobileAdminAccess : false,
                      coreLeader: newRoleType === "chapterRoles" ? prev.coreLeader : false
                    }));
                    if (errors.roleType) setErrors(prev => ({ ...prev, roleType: "" }));
                  }}
                  placeholder="Select Role Type"
                  isClearable
                  styles={selectStyles(errors.roleType)}
                />
                {errors.roleType && (
                  <div className="text-danger text-xs mt-1">
                    {errors.roleType}
                  </div>
                )}
              </div>
              {formData.roleType === "chapterRoles" && (
                <>
                  <div className="col-lg-3 col-md-6 mb-3 pb-3">
                    <div className="form-check d-flex align-items-center mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="mobileAdminAccess"
                        id="mobileAdminAccess"
                        checked={formData.mobileAdminAccess}
                        onChange={handleChange}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <label
                        className="form-check-label ms-2 fw-semibold cursor-pointer"
                        htmlFor="mobileAdminAccess"
                      >
                        Mobile App Admin Access
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3 pb-3">
                    <div className="form-check d-flex align-items-center mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="coreLeader"
                        id="coreLeader"
                        checked={formData.coreLeader}
                        onChange={handleChange}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <label
                        className="form-check-label ms-2 fw-semibold cursor-pointer"
                        htmlFor="coreLeader"
                      >
                        Core Leaders
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* <div className="col-lg-4 col-md-6 mb-24" style={{ paddingTop: "34px" }}>
                <div className="form-check d-flex align-items-start">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="showForAdmin"
                    id="showForAdmin"
                    checked={formData.showForAdmin}
                    onChange={handleChange}
                    style={{ width: "20px", height: "20px", cursor: "pointer", marginTop: "2px" }}
                  />
                  <label
                    className="form-check-label ms-2 cursor-pointer"
                    htmlFor="showForAdmin"
                  >
                    <span className="d-block fw-semibold">Show only Admin Roles</span>
                    <span className="d-block text-xs text-secondary-light">
                      (Not show this role to member Registration)
                    </span>
                  </label>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mb-24" style={{ paddingTop: "34px" }}>
                <div className="form-check d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="mobileAdminAccess"
                    id="mobileAdminAccess"
                    checked={formData.mobileAdminAccess}
                    onChange={handleChange}
                    disabled={formData.showForAdmin}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      opacity: formData.showForAdmin ? 0.5 : 1,
                    }}
                  />
                  <label
                    className="form-check-label ms-2 fw-semibold cursor-pointer"
                    htmlFor="mobileAdminAccess"
                    style={{ opacity: formData.showForAdmin ? 0.5 : 1 }}
                  >
                    Mobile App Admin Menu Access
                  </label>
                </div>
              </div> */}
          </div>

          {/* <div className="col-md-6 mb-4" style={{ position: "relative", bottom: "20px" }}>
              <label className="form-label fw-semibold">
                Role Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control radius-8 ${errors.roleCode ? "is-invalid" : ""}`}
                name="roleCode"
                value={formData.roleCode}
                onChange={handleChange}
                placeholder="Role Code"
                disabled
              />
              {errors.roleCode && (
                <div className="text-danger text-xs mt-1">
                  {errors.roleCode}
                </div>
              )}
            </div> */}
          {/* <div className="col-md-12 mb-4">
              <div className="form-check" style={{ position: "relative", bottom: "15px" }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="showForAdmin"
                  id="showForAdmin"
                  checked={formData.showForAdmin}
                  onChange={handleChange}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <label
                  className="form-check-label ms-2 mt-1 cursor-pointer fw-semibold"
                  htmlFor="showForAdmin"
                >
                  Show For Admin Only
                </label>
              </div>
            </div> */}
          <div className="col-12 mt-4">
            <h6 className="fw-semibold mb-3">Role Permissions</h6>
            <div className="table-responsive rounded-8">
              <table className="table bordered-table sm-table mb-0">
                <thead
                  className="border-bottom border-neutral-200"

                >
                  <tr>
                    <th
                      scope="col"
                      className="fw-semibold text-white px-24 py-16"
                    >
                      Module's
                    </th>
                    {actions.map((action) => (
                      <th
                        key={action.id}
                        scope="col"
                        className="fw-semibold text-white px-24 py-16"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`col-${action.id}`}
                            onChange={() => toggleColumn(action.id)}
                            style={{
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                            checked={
                              modules.length > 0 &&
                              modules
                                .filter(
                                  (m) =>
                                    action.id === "view" ||
                                    !isReportModule(m.name),
                                )
                                .every(
                                  (module) =>
                                    permissions[module._id]?.[action.id],
                                )
                            }
                          />
                          <label
                            className="cursor-pointer"
                            htmlFor={`col-${action.id}`}
                          >
                            {action.label}
                          </label>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module, index) => (
                    <tr
                      key={module._id}
                      className={
                        index !== modules.length - 1
                          ? "border-bottom border-neutral-200"
                          : ""
                      }
                    >
                      <td className="px-24 py-12 fw-medium text-secondary-light">
                        {module.name}
                      </td>
                      {actions.map((action) => {
                        const isReport = isReportModule(module.name);
                        const isDisabled = action.id !== "view" && isReport;

                        return (
                          <td key={action.id} className="px-24 py-12">
                            {isDisabled ? (
                              <input
                                className="form-check-input"
                                type="checkbox"
                                disabled
                                checked={false}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: "#e9ecef",
                                }}
                              />
                            ) : (
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={permissions[module._id]?.[action.id] || false}
                                onChange={() => togglePermission(module._id, action.id)}
                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/user-roles"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            {hasPermission(
              "Roles & Permissions",
              isEditMode ? "edit" : "add",
            ) && (
                <button
                  type="submit"
                  className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                  disabled={isLoading}
                  style={{ width: "120px" }}
                >
                  {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
                </button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRoleFormLayer;
