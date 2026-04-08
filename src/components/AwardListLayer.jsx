import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import AwardApi from "../Api/AwardApi";

const AwardListLayer = () => {
  const { hasPermission } = usePermissions();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [awardToDelete, setAwardToDelete] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await AwardApi.getAward(
        null,
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (response && response.status && response.response) {
        const data = response.response.data;
        if (Array.isArray(data)) {
          setAwards(data);
          setTotalRecords(response.response.total || data.length || 0);
        } else if (data.docs) {
          setAwards(data.docs);
          setTotalRecords(response.response.total || data.total || 0);
        } else {
          setAwards([]);
          setTotalRecords(0);
        }
      } else {
        setAwards([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching awards", error);
      setAwards([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (award) => {
    setAwardToDelete(award);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (awardToDelete) {
      const response = await AwardApi.statusUpdate(awardToDelete._id);
      if (response && response.status) {
        fetchAwards(); // Refresh list
        setShowDeleteModal(false);
        setAwardToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setAwardToDelete(null);
  };

  return (
    <>
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <h6 className="text-primary-600 pb-2 mb-0">Award List</h6>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
              />
              <Icon icon="ion:search-outline" className="icon" />
            </form>
            {hasPermission("Award", "add") && (
              <Link
                to="/award/add"
                className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                
              >
                <Icon
                  icon="ic:baseline-plus"
                  className="icon text-xl line-height-1"
                />
                Add Award
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
                    Award Name
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-24">
                      Loading...
                    </td>
                  </tr>
                ) : awards.length > 0 ? (
                  awards.map((award, index) => (
                    <tr key={index}>
                      <td>{currentPage * rowsPerPage + index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="text-md mb-0 fw-normal text-secondary-light">
                            {award.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        {award.createdAt
                          ? new Date(award.createdAt)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`badge ${award.isActive === 1
                            ? "bg-success-50 text-success-600"
                            : "bg-danger-50 text-danger-600"
                            } px-12 py-4 radius-4`}
                        >
                          {award.isActive === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-10">
                          {hasPermission("Award", "edit") && (
                            <Link
                              to={`/award/edit/${award._id}`}
                              className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon
                                icon="lucide:edit"
                                className="menu-icon"
                              />
                            </Link>
                          )}
                          {hasPermission("Award", "delete") && (
                            <button
                              type="button"
                              onClick={() => confirmDelete(award)}
                              className={`remove-item-btn ${award.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                            >
                              <Icon icon={award.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      {loading ? "Loading..." : "No awards found."}
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

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${awardToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={awardToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${awardToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {awardToDelete?.isActive === 1 ? "inactive" : "active"} award "{awardToDelete?.name}"?
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
              variant={awardToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={awardToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {awardToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AwardListLayer;
