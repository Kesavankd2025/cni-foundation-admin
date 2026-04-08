import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import StarUpdateApi from "../Api/StarUpdateApi";
import ShowNotifications from "../helper/ShowNotifications";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDate, formatDateTime } from "../helper/DateHelper";

const StarUpdateListLayer = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [starUpdates, setStarUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchUpdates();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const response = await StarUpdateApi.getStarHubUpdate(
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (response.status && response.response) {
        const data = response.response.data;
        if (Array.isArray(data)) {
          setStarUpdates(data);
          setTotalRecords(response.response.total || data.length || 0);
        } else if (data.docs) {
          setStarUpdates(data.docs);
          setTotalRecords(response.response.total || data.total || 0);
        } else {
          setStarUpdates([]);
          setTotalRecords(0);
        }
      } else {
        setStarUpdates([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
      setStarUpdates([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };


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
    if (!itemToDelete) return;
    setIsUpdating(true);
    try {
      const response = await StarUpdateApi.statusUpdate(
        itemToDelete._id,
      );
      if (response.status) {
        fetchUpdates();
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);


  const handleResponseClick = (id) => {
    navigate(`/star-update/responses/${id}`);
  };

  const handleView = async (id) => {
    setViewData(null);
    setShowViewModal(true);
    try {
      const response = await StarUpdateApi.getStarHubUpdateFullDetails(id);
      if (response.status) {
        setViewData(response.response.data);
      }
    } catch (error) {
      console.error("Error fetching details", error, id);
    }
  };


  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">CNI Projects</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="navbar-search">
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
          </div>
          {hasPermission("CNI Projects", "add") && (
            <Link
              to="/star-update/add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add CNI Project
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
                  Date
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Image
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Title
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Last Date
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Location
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Response
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
              {starUpdates.length > 0 ? (
                starUpdates.map((item, index) => (
                  <tr key={item._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {formatDate(item.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="w-40-px h-40-px rounded-circle overflow-hidden d-flex align-items-center justify-content-center">
                        {item.image ? (
                          <img
                            src={`${IMAGE_BASE_URL}/${item.image.path || item.image}`}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              const title = item.title || "S";
                              const initial = title.charAt(0).toUpperCase();
                              e.target.outerHTML = `<div class="w-100 h-100 bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                            }}
                          />
                        ) : (
                          <div className="w-100 h-100 bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">
                            {item.title?.charAt(0).toUpperCase() || "S"}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {item.title}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {formatDate(item.lastDate)}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const locationText = typeof item.location === "object" ? item.location?.name : item.location;
                        if (locationText?.length > 20) {
                          return (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id={`tooltip-${item._id}`}>{locationText}</Tooltip>}
                            >
                              <span
                                className="text-md mb-0 fw-normal text-secondary-light"
                                style={{ cursor: "pointer" }}
                              >
                                {locationText.substring(0, 20)}...
                              </span>
                            </OverlayTrigger>
                          );
                        }
                        return (
                          <span className="text-md mb-0 fw-normal text-secondary-light">
                            {locationText}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className="text-primary fw-bold"
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handleResponseClick(item._id)}
                      >
                        {item.responses ? item.responses.length : 0}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${item.isActive === 1
                          ? "bg-success-50 text-success-600"
                          : "bg-danger-50 text-danger-600"
                          } px-12 py-4 radius-4`}
                      >
                        {item.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        {hasPermission("CNI Projects", "view") && (
                          <button
                            type="button"
                            onClick={() => handleView(item._id)}
                            className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon
                              icon="majesticons:eye-line"
                              className="icon text-xl"
                            />
                          </button>
                        )}
                        {hasPermission("CNI Projects", "edit") && (
                          <Link
                            to={`/star-update/edit/${item._id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("CNI Projects", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(item)}
                            className={`remove-item-btn ${item.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon icon={item.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon text-xl" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No star updates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalRecords > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            totalRecords={totalRecords}
          />
        )}
      </div>


      {/* Redesigned View Details Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="lg"
        className="premium-view-modal shadow-lg"
      >
        <Modal.Header className="border-bottom bg-base py-8 px-12">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">

              <h6 className="fw-medium mb-0 fontsize-10" style={{ color: "#003366" }}>
                CNI Projects Details
              </h6>
            </div>
            {viewData && (
              <div>
                <span className={`badge radius-pill px-6 py-2 fw-medium text-uppercase border fontsize-8 ${viewData.isActive === 1 ? "bg-success-focus text-success-main border-success-200" : "bg-danger-focus text-danger-main border-danger-200"}`}>
                  {viewData.isActive === 1 ? "Active" : "Inactive"}
                </span>
              </div>
            )}
          </div>
        </Modal.Header>
        <Modal.Body className="p-12">
          {viewData ? (
            <div className="d-flex flex-column gap-10">
              {/* Modern Banner - Hero Section */}
              <div className="radius-6 p-12 border position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)", borderColor: "#FEE2E2" }}>
                <div className="d-flex align-items-center gap-10">
                  <div className="flex-shrink-0">
                    <div className="radius-6 overflow-hidden border border-neutral-200 shadow-sm" style={{ width: "60px", height: "60px" }}>
                      <img
                        src={viewData.image ? `${IMAGE_BASE_URL}/${viewData.image.path || viewData.image}` : "assets/images/user-grid/user-grid-img13.png"}
                        alt={viewData.title}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => { e.target.src = "assets/images/user-grid/user-grid-img13.png"; }}
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-0">
                    <h6 className="fw-medium mb-0 fontsize-10">{viewData.title}</h6>
                    <div className="d-flex flex-wrap align-items-center gap-x-10 gap-y-2 mt-1">
                      <span className="d-flex align-items-center gap-1 fontsize-9">
                        <Icon icon="solar:calendar-bold-duotone" className="text-danger-600" />
                        Created: {formatDate(viewData.createdAt)}
                      </span>
                      <span className="d-flex align-items-center gap-1 fontsize-9">
                        <Icon icon="solar:map-point-bold-duotone" className="text-danger-600" />
                        {typeof viewData.location === "object" ? viewData.location?.name : viewData.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="p-10 radius-6 bg-white border border-neutral-200 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Icon icon="solar:document-text-bold-duotone" className="text-danger-600 fontsize-10" />
                  <p className="fw-medium mb-0 fontsize-9">
                    Description Details
                  </p>
                </div>
                <p className="px-8 py-4 border-0 text-dark fw-medium fontsize-8">
                  {viewData.details}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="row g-2">
                <div className="col-md-4">
                  <div className="p-8 radius-6 bg-white border border-neutral-200 shadow-sm h-100 transition-all hover-shadow">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Icon icon="solar:calendar-minimalistic-bold-duotone" className="text-danger-600 fontsize-10" />
                      <p className="fw-medium mb-0 fontsize-9">
                        End On
                      </p>
                    </div>
                    <div className="fw-medium text-danger-600 fontsize-9">
                      {formatDate(viewData.lastDate)}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-8 radius-6 bg-white border border-neutral-200 shadow-sm h-100 transition-all hover-shadow">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Icon icon="solar:layers-bold-duotone" className="text-danger-600 fontsize-10" />
                      <p className="fw-medium mb-0 fontsize-9">
                        Target Scope
                      </p>
                    </div>
                    <div className="d-flex flex-column gap-0">
                      <span className="text-dark fw-medium fontsize-9">{viewData.chapterIds?.length || viewData.chapters?.length || 0} Chapters</span>
                      <span className="text-dark fw-medium fontsize-9">{viewData.categoryIds?.length || viewData.categories?.length || 0} Categories</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-8 radius-6 bg-white border border-neutral-200 shadow-sm h-100 transition-all hover-shadow">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-danger-600 fontsize-10" />
                      <p className="fw-medium mb-0 fontsize-9">
                        Participation
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <div className="fw-medium text-danger-600 fontsize-9">{viewData.responses ? viewData.responses.length : 0}</div>
                      <span className="text-secondary-dark fontsize-8">Interested</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Response Feed */}
              <div className="mt-2">
                <div className="d-flex align-items-center gap-2 mb-6 border-bottom pb-3">
                  <Icon icon="solar:user-speak-bold-duotone" className="text-danger-600 fontsize-10" />
                  <p className="text-dark fw-medium mb-0 fontsize-9">
                    Member Interest List
                  </p>
                </div>
                <div className="radius-6 overflow-hidden border border-neutral-200 shadow-sm">
                  <div className="table-responsive" style={{ maxHeight: "160px" }}>
                    <table className="table table-hover mb-0">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-8 py-4 text-dark fw-medium text-uppercase fontsize-8 border-0">Member Info</th>
                          <th className="px-8 py-4 text-dark fw-medium text-uppercase fontsize-8 border-0">Company</th>
                          <th className="px-8 py-4 text-dark fw-medium text-uppercase fontsize-8 border-0 text-end">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.responses && viewData.responses.length > 0 ? (
                          viewData.responses.map((res, i) => (
                            <tr key={i} className="align-middle border-bottom last-border-0">
                              <td className="px-8 py-4 border-0">
                                <div className="d-flex align-items-center gap-6">
                                  <img
                                    src={`${IMAGE_BASE_URL}/${res.profileImage}`}
                                    alt=""
                                    className="w-24-px h-24-px rounded-circle bg-neutral-100 border border-neutral-200 shadow-sm object-fit-cover"
                                    onError={(e) => { e.target.src = "assets/images/user-list/user-list1.png"; }}
                                  />
                                  <div className="d-flex flex-column">
                                    <span className="fw-medium text-dark fontsize-9">{res.fullName}</span>
                                    <span className="text-secondary-dark fw-normal fontsize-7">{res.phoneNumber}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4 border-0 text-dark fw-medium fontsize-8">
                                {res.companyName || "-"}
                              </td>
                              <td className="px-8 py-4 border-0 text-secondary-dark text-end fw-medium fontsize-8">
                                {formatDateTime(res.respondedAt)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-16 text-dark fw-bold border-0 fontsize-9">
                              <Icon icon="solar:info-circle-bold-duotone" className="text-md mb-2 d-block mx-auto opacity-50" />
                              No responses received yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-60">
              <div className="spinner-border text-danger-600" role="status" style={{ width: "2.5rem", height: "2.5rem", borderWidth: "0.2em" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-16 text-dark fw-bold fontsize-10 mb-0">Fetching Update Details...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-8 px-12 bg-base">
          <Button
            variant="danger"
            className="px-20 py-6 radius-6 fw-medium fontsize-10"
            onClick={() => setShowViewModal(false)}

          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${itemToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={itemToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${itemToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {itemToDelete?.isActive === 1 ? "disable" : "enable"} this item?
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
              variant={itemToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              disabled={isUpdating}
              style={itemToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {isUpdating ? "Processing..." : itemToDelete?.isActive === 1 ? "Disable" : "Enable"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StarUpdateListLayer;
