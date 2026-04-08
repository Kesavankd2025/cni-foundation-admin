import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import MemberApi from "../Api/MemberApi";
import { toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const LocationListLayer = () => {
  const { hasPermission } = usePermissions();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchLocations();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await MemberApi.getMemberLocations(
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (res.status && res.response) {
        setLocations(res.response.data || []);
        setTotalRecords(res.response.total || 0);
      } else {
        setLocations([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      const res = await MemberApi.statusUpdateLocation(itemToDelete._id);
      if (res.status) {
        fetchLocations();
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Location List</h6>
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
          {/* 
            Placeholder for Add Location functionality. 
            Permissions check added for consistency when ready.
          */}
          {/* {hasPermission("Location", "add") && (
            <Link
              to="/location/add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
              
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Location
            </Link>
          )} */}
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
                  Member ID
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Member Name
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Chapter
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Region
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Office Location
                </th>
                {/* <th scope="col" style={{ color: "black" }}>
                  Branch location
                </th> */}
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
                  <td colSpan="9" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : locations.length > 0 ? (
                locations.map((location, index) => (
                  <tr key={location._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td style={{ color: "#003366" }}>{location?.membershipId || "N/A"}</td>
                    <td>{location?.fullName || "N/A"}</td>
                    <td>{location?.chapterName || "N/A"}</td>
                    <td>{location?.regionName || "N/A"}</td>
                    <td style={{ maxWidth: "200px" }}>
                      {(location?.location?.name || "").length > 25 ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-location-${index}`}>
                              {location?.location?.name}
                            </Tooltip>
                          }
                        >
                          <div
                            className="text-truncate"
                            style={{ maxWidth: "200px", cursor: "pointer" }}
                          >
                            {location?.location?.name}
                          </div>
                        </OverlayTrigger>
                      ) : (
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {location?.location?.name || "N/A"}
                        </div>
                      )}
                    </td>
                    {/* <td>{location.branchLocation || "N/A"}</td> */}
                    <td>
                      <span
                        className={`badge ${location.isActive === 1
                          ? "bg-success-50 text-success-600"
                          : "bg-danger-50 text-danger-600"
                          } px-12 py-4 radius-4`}
                      >
                        {location.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        {/* {hasPermission("Location", "view") && (
                          <Link
                            to={`/location/view/${location._id}`}
                            className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon
                              icon="majesticons:eye-line"
                              className="icon text-xl"
                            />
                          </Link>
                        )}
                        {hasPermission("Location", "edit") && (
                          <Link
                            to={`/location/edit/${location._id}`}
                            className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )} */}
                        {hasPermission("Locations", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(location)}
                            className={`remove-item-btn ${location.isActive === 1
                              ? "bg-success-focus text-success-600"
                              : "bg-danger-focus text-danger-600"
                              } fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon
                              icon={
                                location.isActive === 1
                                  ? "lucide:unlock"
                                  : "lucide:lock"
                              }
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
                  <td colSpan="9" className="text-center py-4">
                    No locations found.
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

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div
              className={`${itemToDelete?.isActive === 1
                ? "bg-success-focus"
                : "bg-danger-focus"
                } rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}
            >
              <Icon
                icon={
                  itemToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"
                }
                className={`${itemToDelete?.isActive === 1
                  ? "text-success-600"
                  : "text-danger-600"
                  } text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {itemToDelete?.isActive === 1 ? "inactive" : "active"}{" "}
            location for "{itemToDelete?.memberId?.fullName || "this member"}"?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-outline-secondary px-32"
              onClick={handleCloseDelete}
            >
              Cancel
            </button>
            <button
              className={`btn ${itemToDelete?.isActive === 1 ? "btn-primary" : "btn-success"
                } px-32`}
              onClick={handleDelete}
              style={
                itemToDelete?.isActive === 1
                  ? { backgroundColor: "#003366", borderColor: "#003366" }
                  : {}
              }
            >
              {itemToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LocationListLayer;
