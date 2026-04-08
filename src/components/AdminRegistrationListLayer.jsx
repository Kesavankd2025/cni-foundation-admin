import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";
import TablePagination from "./TablePagination";
import AdminUserApi from "../Api/AdminUserApi";

import { IMAGE_BASE_URL } from "../Config/Index";

const AdminRegistrationListLayer = () => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminUserApi.getAdminUser(
        null,
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (response && response.status && response.response) {
        const data = response.response.data;
        if (Array.isArray(data)) {
          setUsers(data);
          setTotalRecords(response.response.total || data.length || 0);
        } else if (data.docs) {
          setUsers(data.docs);
          setTotalRecords(response.response.total || data.total || 0);
        } else {
          setUsers([]);
          setTotalRecords(0);
        }
      } else {
        setUsers([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Failed to fetch admin users", error);
      setUsers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      const response = await AdminUserApi.deleteAdminUser(userToDelete._id);
      if (response && response.status) {
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    }
  };

  const handleClose = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <h6 className="text-primary-600 pb-2 mb-0">Admin Users</h6>
          </div>

          <div className="d-flex align-items-center flex-wrap gap-3">
            <form
              className="navbar-search"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                className="bg-base h-40-px w-auto"
                name="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Icon icon="ion:search-outline" className="icon" />
            </form>
            {hasPermission("Admin Registration", "add") && (
              <Link
                to="/admin-registration/add"
                className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

              >
                <Icon
                  icon="ic:baseline-plus"
                  className="icon text-xl line-height-1"
                />
                Add User
              </Link>
            )}
          </div>
        </div>
        <div className="card-body p-24">
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ color: "black" }}>
                    S.No
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Name
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Email
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Company Name
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Role
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
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-24">
                      Loading...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{currentPage * rowsPerPage + index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-12 justify-content-start">
                          <div className="flex-shrink-0">
                            {user.profileImage && (user.profileImage.path || typeof user.profileImage === "string") ? (
                              <img
                                src={
                                  user.profileImage?.path
                                    ? `${IMAGE_BASE_URL}/${user.profileImage.path}`
                                    : `${IMAGE_BASE_URL}/${user.profileImage}`
                                }
                                alt={user.name}
                                className="w-40-px h-40-px rounded-circle object-fit-cover flex-shrink-0"
                                onError={(e) => {
                                  const name = user.name || "A";
                                  const initial = name.charAt(0).toUpperCase();
                                  e.target.outerHTML = `<div class="w-40-px h-40-px bg-primary-50 text-primary-600 d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"><span class="text-lg fw-semibold">${initial}</span></div>`;
                                }}
                              />
                            ) : (
                              <div className="w-40-px h-40-px bg-primary-50 text-primary-600 d-flex justify-content-center align-items-center rounded-circle flex-shrink-0">
                                <span className="text-lg fw-semibold">
                                  {user.name?.charAt(0)?.toUpperCase() || "A"}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-md mb-0 fw-normal text-secondary-light">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          {user.email}
                        </span>
                      </td>
                      <td>{user.companyName}</td>

                      <td>
                        <span className="badge bg-primary-focus text-primary-600 border px-24 py-4 radius-4 fw-medium text-sm">
                          {user.roleName || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge px-24 py-4 radius-4 fw-medium text-sm ${user.isActive === 1
                            ? "bg-success-focus text-success-main"
                            : "bg-danger-focus text-danger-main"
                            }`}
                        >
                          {user.isActive === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-10">
                          {hasPermission("Admin Registration", "view") && (
                            <Link
                              to={`/admin-registration/view/${user._id}`}
                              className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon
                                icon="majesticons:eye-line"
                                className="icon text-xl"
                              />
                            </Link>
                          )}
                          {hasPermission("Admin Registration", "edit") && (
                            <Link
                              to={`/admin-registration/edit/${user._id}`}
                              className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon
                                icon="lucide:edit"
                                className="menu-icon"
                              />
                            </Link>
                          )}
                          {hasPermission("Admin Registration", "delete") && (
                            <button
                              type="button"
                              onClick={() => confirmDelete(user)}
                              className={`remove-item-btn ${user.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                            >
                              <Icon icon={user.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-24">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            totalRecords={totalRecords}
          />
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={handleClose} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${userToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={userToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${userToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {userToDelete?.isActive === 1 ? "inactive" : "active"} user "{userToDelete?.name}"?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant={userToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={userToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {userToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminRegistrationListLayer;
