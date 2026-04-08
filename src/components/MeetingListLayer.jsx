import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";
import MeetingApi from "../Api/MeetingApi";
import TablePagination from "./TablePagination";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDateTime } from "../helper/DateHelper";
import { toPascalCase } from "../helper/TextHelper";

const MeetingListLayer = () => {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await MeetingApi.getMeeting(
        null,
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (response && response.status && response.response) {
        const resData = response.response.data;
        if (Array.isArray(resData)) {
          setData(resData);
          setTotalRecords(response.response.total || resData.length || 0);
        } else if (resData.docs) {
          setData(resData.docs);
          setTotalRecords(response.response.total || resData.total || 0);
        } else {
          setData([]);
          setTotalRecords(0);
        }
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error loading meetings:", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);
  const confirmDelete = (meeting) => {
    setMeetingToDelete(meeting);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (meetingToDelete) {
      const response = await MeetingApi.statusUpdate(
        meetingToDelete._id || meetingToDelete.id,
      );
      if (response.status) {
        loadData();
        setShowDeleteModal(false);
        setMeetingToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setMeetingToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const showQRCode = (meeting) => {
    setSelectedMeeting(meeting);
    setShowQRModal(true);
  };

  const showViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowViewModal(true);
  };

  const handleDownloadQR = async (meeting) => {
    try {
      const qrPath = meeting?.qrImage?.Path || meeting?.qrImage?.path;
      if (!qrPath) return;

      const imageUrl = `${IMAGE_BASE_URL}/${qrPath}`;
      const fileName = `Meeting_QR_${meeting?.meetingTopic || "Code"}.png`
        .replace(/[^a-z0-9]/gi, "_");

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("QR download failed:", error);
    }
  };
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "live":
        return "bg-success-focus text-success-main";
      case "completed":
        return "bg-info-focus text-info-main";
      case "upcoming":
      case "planned":
        return "bg-warning-focus text-warning-main";
      case "cancelled":
        return "bg-danger-focus text-danger-main";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Meetings List</h6>
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

          {hasPermission("Meeting Creation", "add") && (
            <Link
              to="/meeting-creation/add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Meeting
            </Link>
          )}
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Meeting Topic</th>
                <th scope="col">Meeting Fee</th>
                <th scope="col">Visitors Fee</th>
                <th scope="col">Chapter</th>
                <th scope="col">Start Date & Time</th>
                <th scope="col">End Date & Time</th>
                <th scope="col" className="text-center">
                  QR Code
                </th>
                <th scope="col">Meeting Status</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    Loading meetings...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    No meetings found.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id || item.id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{item.meetingTopic}</td>
                    <td>₹{item.meetingFee}</td>
                    <td>₹{item.visitorFee}</td>
                    <td>
                      {Array.isArray(item.chapters)
                        ? item.chapters
                          .map((chapter) => chapter.chapterName)
                          .join(", ")
                        : item.chapters}
                    </td>
                    <td>{formatDateTime(item.startDateTime)}</td>
                    <td>{formatDateTime(item.endDateTime)}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center">
                        <div
                          className="w-50-px h-50-px bg-neutral-200 rounded d-flex align-items-center justify-content-center cursor-pointer"
                          onClick={() => showQRCode(item)}
                          style={{ cursor: "pointer" }}
                        >
                          <Icon
                            icon="ri:qr-code-line"
                            className="text-xl text-neutral-600"
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge px-12 py-4 radius-4 ${getStatusBadgeClass(
                          item.meetingStatus,
                        )}`}
                      >
                        {toPascalCase(item.meetingStatus || "Upcoming")}
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
                        {hasPermission("Meeting Creation", "view") && (
                          <button
                            type="button"
                            onClick={() => showViewDetails(item)}
                            className="bg-info-focus text-info-600 bg-hover-info-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            title="View Details"
                          >
                            <Icon
                              icon="mdi:eye-outline"
                              className="menu-icon"
                            />
                          </button>
                        )}
                        {hasPermission("Meeting Creation", "edit") && (
                          <Link
                            to={`/meeting-creation/edit/${item._id || item.id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Meeting Creation", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(item)}
                            className={`remove-item-btn ${item.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon icon={item.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
      </div >

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${meetingToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={meetingToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${meetingToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {meetingToDelete?.isActive === 1 ? "inactive" : "active"} meeting "{meetingToDelete?.meetingTopic}"?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant={meetingToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={meetingToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {meetingToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* View Details Modal */}
      <Modal centered show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton className="bg-base border-bottom">
          <h6 className="text-primary-600 fw-bold mb-0">Meeting Details</h6>
        </Modal.Header>
        <Modal.Body className="p-24">
          {selectedMeeting && (
            <div className="row gy-3">
              <div className="col-md-6 mb-3">
                <label className="text-sm text-secondary-light fw-medium mb-1">Meeting Topic</label>
                <h6 className="mb-0 text-primary-600">{selectedMeeting.meetingTopic}</h6>
              </div>
              <div className="col-md-6 mb-3">
                <label className="text-sm text-secondary-light fw-medium mb-1">Chapter</label>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {Array.isArray(selectedMeeting.chapters) ? (
                    selectedMeeting.chapters.map((c, i) => (
                      <span key={i} className="badge bg-primary-50 text-primary-600 radius-4 px-12 py-4">
                        {c.chapterName || c.name}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-primary-50 text-primary-600 radius-4 px-12 py-4">
                      {selectedMeeting.chapters}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="text-sm text-secondary-light fw-medium mb-1">Meeting Fee</label>
                <h6 className="mb-0">₹{selectedMeeting.meetingFee}</h6>
              </div>
              <div className="col-md-6 mb-3">
                <label className="text-sm text-secondary-light fw-medium mb-1">Visitor Fee</label>
                <h6 className="mb-0 text-warning-600">₹{selectedMeeting.visitorFee}</h6>
              </div>
              <div className="col-md-12 mb-3">
                <label className="text-sm text-secondary-light fw-medium mb-1">Location</label>
                <p className="mb-0 d-flex align-items-center gap-2">
                  <Icon icon="mdi:map-marker" className="text-danger-600 text-xl" />
                  {selectedMeeting.location?.name || selectedMeeting.location || "Not Specified"}
                </p>
              </div>
              <div className="col-md-6">
                <label className="text-sm text-secondary-light fw-medium mb-1">Start Date And Time</label>
                <p className="mb-0 d-flex align-items-center gap-2">
                  <Icon icon="mdi:calendar-clock" className="text-primary-600" />
                  {formatDateTime(selectedMeeting.startDateTime)}
                </p>
              </div>
              <div className="col-md-6">
                <label className="text-sm text-secondary-light fw-medium mb-1">End Date And Time</label>
                <p className="mb-0 d-flex align-items-center gap-2">
                  <Icon icon="mdi:calendar-clock" className="text-primary-600" />
                  {formatDateTime(selectedMeeting.endDateTime)}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="outline-danger" onClick={() => setShowViewModal(false)} className="px-32 radius-8">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Code Modal */}
      <Modal centered show={showQRModal} onHide={() => setShowQRModal(false)}>
        <Modal.Body className="p-0 radius-8 overflow-hidden">
          {selectedMeeting && (
            <div className="text-center">
              <div className="bg-primary-600 py-20 px-24 text-white">
                <h5 className="text-white mb-0">Meeting QR Code</h5>
                <p className="text-white text-xs mb-0 mt-1 opacity-75">{selectedMeeting.meetingTopic}</p>
              </div>
              <div className="p-40 bg-white">
                <div className="d-flex justify-content-center mb-24">
                  <div className="bg-white p-3 shadow-md rounded-12 d-inline-block border border-neutral-100">
                    {selectedMeeting.qrImage?.Path || selectedMeeting.qrImage?.path ? (
                      <img
                        src={`${IMAGE_BASE_URL}/${selectedMeeting.qrImage.Path || selectedMeeting.qrImage.path}`}
                        alt="Meeting QR Code"
                        className="img-fluid"
                        style={{ maxHeight: "250px", maxWidth: "100%" }}
                      />
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center p-20">
                        <Icon icon="ri:qr-code-line" style={{ fontSize: "150px" }} className="text-neutral-200" />
                        <p className="text-xs text-secondary-light mt-2">QR Not Available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  <Button
                    variant="primary"
                    className="w-100 py-10 radius-8 d-flex align-items-center justify-content-center gap-2"

                    onClick={() => handleDownloadQR(selectedMeeting)}
                  >
                    <Icon icon="mdi:download" className="text-lg" />
                    Download QR Code
                  </Button>
                  <Button variant="outline-secondary" className="w-100 py-10 radius-8" onClick={() => setShowQRModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div >
  );
};

export default MeetingListLayer;
