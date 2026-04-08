import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import RoleApi from "../Api/RoleApi";
import ShowNotifications from "../helper/ShowNotifications";

const UserRoleListLayer = () => {
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await RoleApi.getRoles({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      });

      if (response.status) {
        setRoles(response.response.data || []);
        setTotalRecords(response.response.total || 0);
      } else {
        setRoles([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      ShowNotifications.showAlertNotification("Error fetching roles", false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, rowsPerPage, searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (roleToDelete) {
      const response = await RoleApi.deleteRole(roleToDelete._id);
      if (response.status) {
        fetchRoles();
        setShowDeleteModal(false);
        setRoleToDelete(null);
      }
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Roles & Permissions</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              name="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
            <Icon icon="ion:search-outline" className="icon" />
          </form>
          {hasPermission("Roles & Permissions", "add") && (
            <Link
              to="/user-roles/create"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
              
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Role
            </Link>
          )}
        </div>
      </div>
      <div className="card-body p-24">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            <div className="table-responsive scroll-sm">
              <table className="table bordered-table sm-table mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ color: "black" }}>
                      S.No
                    </th>
                    <th scope="col" style={{ color: "black" }}>
                      Role Name
                    </th>
                    <th scope="col" style={{ color: "black" }}>
                      Created Date
                    </th>
                    <th scope="col" style={{ color: "black" }}>
                      Status
                    </th>
                    <th scope="col" style={{ color: "black" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles && roles.length > 0 ? (
                    roles.map((role, index) => (
                      <tr key={role._id}>
                        <td>{currentPage * rowsPerPage + index + 1}</td>
                        <td>
                          <span className="text-md mb-0 fw-medium text-secondary-light">
                            {role.name}
                          </span>
                        </td>
                        <td>
                          <span className="text-md mb-0 fw-normal text-secondary-light">
                            {new Date(role.createdAt)
                              .toLocaleDateString("en-GB")
                              .replace(/\//g, "-")}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge px-24 py-4 radius-4 fw-medium text-sm ${role.isActive === 1
                              ? "bg-success-focus text-success-main"
                              : "bg-danger-focus text-danger-main"
                              }`}
                          >
                            {role.isActive === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-10">
                            {hasPermission("Roles & Permissions", "edit") && (

                              <Link
                                to={`/user-roles/edit/${role._id}`}
                                className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                              >
                                <Icon
                                  icon="lucide:edit"
                                  className="menu-icon"
                                />
                              </Link>

                            )}
                            {hasPermission("Roles & Permissions", "delete") &&
                              role.name !== "ADMIN" && (
                                <button
                                  type="button"
                                  onClick={role.isEditable !== false ? () => confirmDelete(role) : undefined}
                                  className={`remove-item-btn ${role.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0 ${role.isEditable === false ? 'opacity-50' : ''}`}
                                  style={{ cursor: role.isEditable === false ? 'not-allowed' : 'pointer' }}
                                  disabled={role.isEditable === false}
                                  title={role.isEditable === false ? "This role status cannot be changed" : ""}
                                >
                                  <Icon
                                    icon={role.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                                    className="menu-icon"
                                  />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No roles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              totalRecords={totalRecords}
            />
          </>
        )}
      </div>

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${roleToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={roleToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${roleToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {roleToDelete?.isActive === 1 ? "inactive" : "active"} role "{roleToDelete?.name}"?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseDelete}
            >
              Cancel
            </Button>
            <Button
              variant={roleToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={roleToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {roleToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserRoleListLayer;
