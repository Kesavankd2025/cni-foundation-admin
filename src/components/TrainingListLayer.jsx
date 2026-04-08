import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import { Modal, Button } from "react-bootstrap";

import TrainingApi from "../Api/TrainingApi";
import { formatDate, formatTime } from "../helper/DateHelper";
import { toPascalCase } from "../helper/TextHelper";
import { IMAGE_BASE_URL } from "../Config/Index";

const TrainingListLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState(null);

  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchTrainings();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const response = await TrainingApi.getTraining(
        null,
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (response && response.status && response.response) {
        const data = response.response.data;
        if (Array.isArray(data)) {
          setTrainings(data);
          setTotalRecords(response.response.total || data.length || 0);
        } else if (data.docs) {
          setTrainings(data.docs);
          setTotalRecords(response.response.total || data.total || 0);
        } else {
          setTrainings([]);
          setTotalRecords(0);
        }
      } else {
        setTrainings([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setTrainings([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };


  const confirmDelete = (training) => {
    setTrainingToDelete(training);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (trainingToDelete) {
      const response = await TrainingApi.statusUpdate(
        trainingToDelete._id || trainingToDelete.trainingId,
      );
      if (response && response.status) {
        fetchTrainings();
        setShowDeleteModal(false);
        setTrainingToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTrainingToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
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

  const handleViewClick = (training) => {
    navigate(`/training-participants/${training._id || training.trainingId}`);
  };

  const handleCloseModal = () => {
    setSelectedTraining(null);
    setShowQRModal(false);
  };



  const handleDownloadQR = async (training) => {
    try {
      const rawQr = training?.paymentQrImage || training?.qrImage;
      const qrPath = typeof rawQr === 'string' ? rawQr : (rawQr?.Path || rawQr?.path);
      if (!qrPath) return;

      const imageUrl = `${IMAGE_BASE_URL}/${qrPath}`;
      const fileName = `Training_QR_${training?.title || "Code"}.png`
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


  const handleParticipantPageChange = (page) => {
    // setParticipantCurrentPage(page);
  };

  const handleParticipantRowsPerPageChange = (e) => {
    // setParticipantRowsPerPage(parseInt(e.target.value));
    // setParticipantCurrentPage(0);
  };

  const handleFeeStatusChange = async (id, newStatus) => {
    // This is now handled in the dedicated page
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">Training List</h6>
        <div className="d-flex align-items-center flex-wrap gap-3 ms-auto">
          <form className="navbar-search" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="bg-base h-40-px"
              style={{ minWidth: "150px", width: '100%' }}
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
          {hasPermission("Training", "add") && (
            <Link
              to="/training-create"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Training
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
                <th scope="col">Training ID</th>
                <th scope="col" style={{ minWidth: "150px" }}>
                  Training Title
                </th>
                <th scope="col" style={{ minWidth: "150px" }}>
                  Training Fee
                </th>
                <th scope="col" style={{ minWidth: "150px" }}>
                  Date & Time
                </th>
                <th scope="col" className="text-center">
                  QR Code
                </th>
                <th scope="col" className="text-center">
                  Payment QR
                </th>
                <th scope="col">Training Status</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div
                      className="spinner-border text-primary spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Loading trainings...
                  </td>
                </tr>
              ) : trainings.length > 0 ? (
                trainings.map((item, index) => (
                  <tr key={item._id || item.trainingId}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <span className="text-md mb-0 fw-medium text-primary-600">
                        {item.trainingId || item._id}
                      </span>
                    </td>

                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light text-wrap">
                        {item.title}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {item.trainingFee}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          {formatDate(item.trainingDateTime)}
                        </span>
                        <span className="text-xs text-secondary-light">
                          {formatTime(item.trainingDateTime)}
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center">
                        {item.qrImage ? (
                          <div className="w-50-px h-50-px border p-2 rounded bg-white">
                            <img
                              src={`${IMAGE_BASE_URL}/${item.qrImage?.path || item.qrImage}`}
                              alt="Training QR"
                              className="w-100 h-100 object-fit-cover cursor-pointer"
                              onError={(e) => {
                                e.target.parentElement.outerHTML = `<div class="w-50-px h-50-px border d-flex align-items-center justify-content-center rounded bg-neutral-100 text-secondary-light fw-medium text-center" style="font-size: 10px;">No Image</div>`;
                              }}
                              onClick={() => {
                                setSelectedTraining({
                                  ...item,
                                  activeModalQR: item.qrImage,
                                  isPaymentQR: false
                                });
                                setShowQRModal(true);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-50-px h-50-px border d-flex align-items-center justify-content-center rounded bg-neutral-100 text-secondary-light fw-medium text-center" style={{ fontSize: '10px' }}>
                            No Image
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center">
                        {item.paymentQrImage ? (
                          <div className="w-50-px h-50-px border p-2 rounded bg-white overflow-hidden">
                            <img
                              src={`${IMAGE_BASE_URL}/${item.paymentQrImage?.path || item.paymentQrImage}`}
                              alt="Payment QR"
                              className="w-100 h-100 object-fit-cover cursor-pointer"
                              onError={(e) => {
                                e.target.parentElement.outerHTML = `<div class="w-50-px h-50-px border d-flex align-items-center justify-content-center rounded bg-neutral-100 text-secondary-light fw-medium text-center" style="font-size: 10px;">No Image</div>`;
                              }}
                              onClick={() => {
                                setSelectedTraining({
                                  ...item,
                                  activeModalQR: item.paymentQrImage,
                                  isPaymentQR: true
                                });
                                setShowQRModal(true);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-50-px h-50-px border d-flex align-items-center justify-content-center rounded bg-neutral-100 text-secondary-light fw-medium text-center" style={{ fontSize: '10px' }}>
                            No Image
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge px-12 py-4 radius-4 ${getStatusBadgeClass(
                          item.status,
                        )}`}
                      >
                        {toPascalCase(item.status || "Upcoming")}
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
                        {hasPermission("Training", "view") && (
                          <button
                            onClick={() => handleViewClick(item)}
                            className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                          >
                            <Icon
                              icon="majesticons:eye-line"
                              className="icon text-xl"
                            />
                          </button>
                        )}
                        {hasPermission("Training", "edit") && (
                          <Link
                            to={`/training-edit/${item._id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}

                        {hasPermission("Training", "delete") && (
                          <button
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
                    No trainings found.
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

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${trainingToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={trainingToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${trainingToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {trainingToDelete?.isActive === 1 ? "inactive" : "active"} training "{trainingToDelete?.title}"?
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
              variant={trainingToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={trainingToDelete?.isActive === 1 ? { backgroundColor: "#C4161C", borderColor: "#C4161C" } : {}}
            >
              {trainingToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* QR Code Modal */}
      <Modal centered show={showQRModal} onHide={handleCloseModal}>
        <Modal.Body className="p-0 radius-8 overflow-hidden">
          {selectedTraining && (
            <div className="text-center">
              <div className="bg-primary-600 py-20 px-24 text-white">
                <h5 className="text-white mb-0">
                  {selectedTraining.isPaymentQR ? "Payment QR Code" : "Training QR Code"}
                </h5>
                <p className="text-white text-xs mb-0 mt-1 opacity-75">{selectedTraining.title}</p>
              </div>
              <div className="p-40 bg-white">
                <div className="d-flex justify-content-center mb-24">
                  <div className="bg-white p-3 shadow-md rounded-12 d-inline-block border border-neutral-100">
                    {selectedTraining.activeModalQR ? (
                      <img
                        src={`${IMAGE_BASE_URL}/${typeof selectedTraining.activeModalQR === 'string' ? selectedTraining.activeModalQR : (selectedTraining.activeModalQR?.path || selectedTraining.activeModalQR?.Path)}`}
                        alt="QR Code"
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
                    style={{ backgroundColor: "#C4161C", borderColor: "#C4161C" }}
                    onClick={() => handleDownloadQR({
                      ...selectedTraining,
                      paymentQrImage: selectedTraining.isPaymentQR ? selectedTraining.activeModalQR : null,
                      qrImage: !selectedTraining.isPaymentQR ? selectedTraining.activeModalQR : null
                    })}
                  >
                    <Icon icon="mdi:download" className="text-lg" />
                    Download QR Code
                  </Button>

                  <Button variant="outline-secondary" className="w-100 py-10 radius-8" onClick={handleCloseModal}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TrainingListLayer;
