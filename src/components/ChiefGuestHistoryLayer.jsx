import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import TablePagination from "./TablePagination";
import ReportApi from "../Api/ReportApi";
import { Spinner } from "react-bootstrap";

const ChiefGuestHistoryLayer = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchHistory = async () => {
    if (!id) return;
    setLoading(true);
    const params = {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearchTerm,
      chiefGuestId: id,
    };
    const response = await ReportApi.getChiefGuestHistory(params);
    if (response.status && response.response) {
      const data = response.response.data;
      if (Array.isArray(data)) {
        setHistory(data);
        setTotalRecords(response.response.total || data.length || 0);
      } else if (data.docs) {
        setHistory(data.docs);
        setTotalRecords(response.response.total || data.total || 0);
      } else {
        setHistory([]);
        setTotalRecords(0);
      }
    } else {
      setHistory([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [id, currentPage, rowsPerPage, debouncedSearchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Chief Guest History</h6>
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
          <Link
            to="/chief-guest-list"
            className="btn btn-secondary text-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon
              icon="ic:baseline-arrow-back"
              className="icon text-xl line-height-1"
            />
            Back to List
          </Link>
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
                    Chapter Name
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Invited By
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Meeting Date
                  </th>
                  <th scope="col" style={{ color: "black" }}>
                    Meeting Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <tr key={index}>
                      <td>{currentPage * rowsPerPage + index + 1}</td>
                      <td>{item.chapterName || "—"}</td>
                      <td>{item.invitedBy || "—"}</td>
                      <td>
                        {item.meetingDate
                          ? new Date(item.meetingDate).toLocaleDateString('en-GB')
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge radius-4 px-10 py-4 text-sm ${item.meetingStatus === "Attended" || item.meetingStatus === "Present"
                            ? "bg-success-focus text-success-main"
                            : item.meetingStatus === "Absent" || item.meetingStatus === "Rejected"
                              ? "bg-danger-focus text-danger-main"
                              : "bg-warning-focus text-warning-main"
                            }`}
                        >
                          {item.meetingStatus || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-secondary-light">
                      No history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
};

export default ChiefGuestHistoryLayer;
