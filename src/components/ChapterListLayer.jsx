import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import ChapterApi from "../Api/ChapterApi";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";
import TablePagination from "./TablePagination";

const ChapterListLayer = () => {
  const { hasPermission } = usePermissions();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Ã¢â€ Â CHANGED: Start from 1
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0); // Ã¢â€ Â NEW: Store API's totalPages
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchChapters();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const fetchChapters = async () => {
    try {
      setLoading(true);

      // Ã¢Å“â€¦ FIX: Pass parameters as object with correct naming
      const response = await ChapterApi.getChapter({
        page: currentPage,        // 1-based page number
        limit: rowsPerPage,       // Use 'limit' not 'rowsPerPage'
        search: debouncedSearchTerm
      });

      if (response && response.status && response.response) {
        const apiData = response.response;

        // Ã¢Å“â€¦ FIX: Use API's data structure directly
        if (Array.isArray(apiData.data)) {
          setChapters(apiData.data);
          setTotalRecords(apiData.total || 0);
          setTotalPages(apiData.totalPages || 1); // Ã¢â€ Â Use API's totalPages
        } else {
          setChapters([]);
          setTotalRecords(0);
          setTotalPages(0);
        }
      } else {
        setChapters([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast.error("Failed to fetch chapters");
      setChapters([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (chapter) => {
    setChapterToDelete(chapter);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (chapterToDelete) {
      const response = await ChapterApi.statusUpdate(chapterToDelete._id);
      if (response && response.status) {
        fetchChapters();
        setShowDeleteModal(false);
        setChapterToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setChapterToDelete(null);
  };

  // Ã¢Å“â€¦ REMOVED: Don't calculate, use API's totalPages
  // const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h6 className="text-primary-600 pb-2 mb-0">Chapter List</h6>
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
          {hasPermission("Chapter Creation", "add") && (
            <Link
              to="/chapter-creation/add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
              
            >
              <Icon icon="ic:baseline-plus" className="text-xl" />
              Add Chapter
            </Link>
          )}
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" className="text-center" style={{ color: "black" }}>
                  S.No
                </th>
                <th scope="col" style={{ color: "black" }}>Chapter Name</th>
                <th scope="col" style={{ color: "black" }}>Location</th>
                <th scope="col" style={{ color: "black" }}>Zone</th>
                <th scope="col" style={{ color: "black" }}>Region</th>
                <th scope="col" style={{ color: "black" }}>Created Date</th>
                <th scope="col" style={{ color: "black" }}>Status</th>
                <th scope="col" style={{ color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : chapters.length > 0 ? (
                chapters.map((chapter, index) => (
                  <tr key={chapter._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {chapter.chapterName}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {chapter.location}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {chapter.zoneName || chapter.zoneId?.name || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {chapter.regionName || chapter.regionId?.name || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {chapter.createdDate
                          ? new Date(chapter.createdDate)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${chapter.isActive === 1
                          ? "bg-success-50 text-success-600"
                          : "bg-danger-50 text-danger-600"
                          } px-12 py-4 radius-4`}
                      >
                        {chapter.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {hasPermission("Chapter Creation", "view") && (
                          <Link
                            to={`/chapter-view/${chapter._id}`}
                            className="bg-info-focus text-info-600 bg-hover-info-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="majesticons:eye-line" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Chapter Creation", "edit") && (
                          <>
                            <Link
                              to={`/chapter-creation/edit/${chapter._id}`}
                              className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon icon="lucide:edit" className="menu-icon" />
                            </Link>
                            <Link
                              to={`/chapter-roles/${chapter._id}`}
                              className="bg-role-custom text-primary-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon icon="solar:user-id-bold" className="menu-icon" />
                            </Link>
                          </>
                        )}
                        {hasPermission("Chapter Creation", "delete") && (
                          <button
                            onClick={() => confirmDelete(chapter)}
                            className={`remove-item-btn ${chapter.isActive === 1
                              ? "bg-success-focus text-success-600"
                              : "bg-danger-focus text-danger-600"
                              } fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon
                              icon={chapter.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
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
                  <td colSpan="8" className="text-center py-4">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
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

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div
              className={`${chapterToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"
                } rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}
            >
              <Icon
                icon={chapterToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${chapterToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"
                  } text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {chapterToDelete?.isActive === 1 ? "inactive" : "active"} chapter "
            {chapterToDelete?.chapterName}"?
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
              variant={chapterToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={
                chapterToDelete?.isActive === 1
                  ? { backgroundColor: "#003366", borderColor: "#003366" }
                  : {}
              }
            >
              {chapterToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChapterListLayer;