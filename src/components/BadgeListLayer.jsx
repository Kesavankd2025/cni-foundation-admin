import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";
import BadgeApi from "../Api/BadgeApi";
import TablePagination from "./TablePagination";
import { IMAGE_BASE_URL } from "../Config/Index";

const BadgeListLayer = () => {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await BadgeApi.getBadge(
        null,
        currentPage,
        rowsPerPage,
        "",
        debouncedSearchTerm,
      );
      if (response && response.status && response.response) {
        const data = response.response.data;
        if (Array.isArray(data)) {
          setData(data);
          setTotalRecords(response.response.total || data.length || 0);
        } else if (data.docs) {
          setData(data.docs);
          setTotalRecords(response.response.total || data.total || 0);
        } else {
          setData([]);
          setTotalRecords(0);
        }
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error loading badges:", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const confirmDelete = (badge) => {
    setBadgeToDelete(badge);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (badgeToDelete) {
      const response = await BadgeApi.statusUpdate(
        badgeToDelete._id || badgeToDelete.id,
      );
      if (response.status) {
        loadData();
        setShowDeleteModal(false);
        setBadgeToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBadgeToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Badge List</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search" onSubmit={(e) => e.preventDefault()}>
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
          {hasPermission("Badge Creation", "add") && (
            <Link
              to="/badge/create"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
              
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Badge
            </Link>
          )}
          <Link
            to="/badge/assign"
            className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon
              icon="lucide:user-check"
              className="icon text-xl line-height-1"
            />
            Assigned
          </Link>
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Type</th>
                <th scope="col">Badge Name</th>
                <th scope="col">Image</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No badges found.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td className="text-capitalize">{item.type}</td>
                    <td className="fw-medium">{item.name}</td>
                    <td>
                      <div className="w-40-px h-40-px rounded overflow-hidden border border-neutral-200">
                        {item.badgeImage?.path ? (
                          <img
                            src={`${IMAGE_BASE_URL}/${item.badgeImage.path}`}
                            alt="badge"
                            className="w-100 h-100 object-fit-contain"
                          />
                        ) : (
                          <div className="w-100 h-100 bg-neutral-100 d-flex align-items-center justify-content-center">
                            <Icon icon="ri:image-line" className="text-neutral-400" />
                          </div>
                        )}
                      </div>
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
                        {hasPermission("Badge Creation", "edit") && (
                          <Link
                            to={`/badge/edit/${item._id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Badge Creation", "delete") && (
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
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${badgeToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={badgeToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${badgeToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {badgeToDelete?.isActive === 1 ? "inactive" : "active"} badge "{badgeToDelete?.name}"?
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
              variant={badgeToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={badgeToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {badgeToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BadgeListLayer;
