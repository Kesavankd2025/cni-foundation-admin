import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import ChiefGuestApi from "../Api/ChiefGuestApi";
import { Spinner, Modal, Button } from "react-bootstrap";
import { IMAGE_BASE_URL } from "../Config/Index";

const ChiefGuestListLayer = () => {
  const { hasPermission } = usePermissions();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchGuests = async () => {
    setLoading(true);
    const response = await ChiefGuestApi.getChiefGuests(
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
    );
    if (response.status && response.data) {
      const data = response.data.data;
      if (Array.isArray(data)) {
        setGuests(data);
        setTotalRecords(response.data.total || data.length || 0);
      } else if (data.docs) {
        setGuests(data.docs);
        setTotalRecords(response.data.total || data.total || 0);
      } else {
        setGuests([]);
        setTotalRecords(0);
      }
    } else {
      setGuests([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGuests();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);


  const confirmDelete = (guest) => {
    setGuestToDelete(guest);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (guestToDelete) {
      setIsUpdating(true);
      const response = await ChiefGuestApi.statusUpdate(guestToDelete._id);
      if (response.status) {
        fetchGuests();
        setShowDeleteModal(false);
        setGuestToDelete(null);
      }
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Chief Guest List</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search">
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
          {hasPermission("Chief Guest List", "add") && (
            <Link
              to="/chief-guest-add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Chief Guest
            </Link>
          )}
        </div>
      </div>
      <div className="card-body p-24">
        {loading ? (
          <div className="d-flex justify-content-center py-50">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ color: "black" }}>
                    S.No
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Chief Guest Name
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Phone Number
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Business Name
                  </th>
                  {/* <th scope="col" style={{ color: "black" }}>
                    Location
                  </th> */}
                  <th scope="col" style={{ color: "black" }}>
                    Referred By
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
                {guests.length > 0 ? (
                  guests.map((guest, index) => (
                    <tr key={guest._id}>
                      <td>{currentPage * rowsPerPage + index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {guest.profileImage && (guest.profileImage.path || typeof guest.profileImage === "string") ? (
                            <img
                              src={
                                guest.profileImage?.path
                                  ? `${IMAGE_BASE_URL}/${guest.profileImage.path}`
                                  : `${IMAGE_BASE_URL}/${guest.profileImage}`
                              }
                              alt=""
                              className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                              onError={(e) => {
                                const name = guest.chiefGuestName || "C";
                                const initial = name.charAt(0).toUpperCase();
                                e.target.outerHTML = `<div class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                              }}
                            />
                          ) : (
                            <div
                              className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg"
                            >
                              {guest.chiefGuestName?.charAt(0).toUpperCase() || "C"}
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <span className="text-md mb-0 fw-medium text-secondary-light d-block">
                              {guest.chiefGuestName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{guest.contactNumber}</td>
                      <td>{guest.businessName}</td>
                      {/* <td>{guest.location}</td> */}
                      <td>
                        {guest.referredByName || "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${guest.isActive === 1
                            ? "bg-success-focus text-success-main"
                            : "bg-danger-focus text-danger-main"
                            } px-24 py-4 radius-4 fw-medium text-sm`}
                        >
                          {guest.isActive === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-10">
                          {hasPermission("Chief Guest List", "view") && (
                            <Link
                              to={`/chief-guest-history/${guest._id}`}
                              className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon
                                icon="lucide:eye"
                                className="icon text-sm"
                              />
                            </Link>
                          )}
                          {hasPermission("Chief Guest List", "edit") && (
                            <Link
                              to={`/chief-guest-edit/${guest._id}`}
                              className="btn-edit-custom fw-medium w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon
                                icon="lucide:edit"
                                className="icon text-sm"
                              />
                            </Link>
                          )}
                          {hasPermission("Chief Guest List", "delete") && (
                            <button
                              type="button"
                              onClick={() => confirmDelete(guest)}
                              className={`remove-item-btn ${guest.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                            >
                              <Icon icon={guest.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="icon text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No chief guests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          totalRecords={totalRecords}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${guestToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={guestToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${guestToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {guestToDelete?.isActive === 1 ? "disable" : "enable"} chief guest "{guestToDelete?.chiefGuestName}"?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={guestToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              disabled={isUpdating}
              style={guestToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {isUpdating ? "Processing..." : guestToDelete?.isActive === 1 ? "Disable" : "Enable"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChiefGuestListLayer;
