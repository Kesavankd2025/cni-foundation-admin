import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventApi from "../Api/EventApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import TablePagination from "./TablePagination";
import { formatDate } from "../helper/DateHelper";

const EventsMediaListLayer = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, rowsPerPage]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await EventApi.getEventList(currentPage, rowsPerPage);
      if (res.status && res.response) {
        const data = res.response.data;
        setRecords(data || []);
        setTotalRecords(res.response.total || (data ? data.length : 0));
      }
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await EventApi.deleteEvent(id);
        if (res.status) {
          fetchEvents();
        }
      } catch (error) {
        console.error("Error deleting event", error);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
          <h6 className="text-primary-600 pb-2 mb-0">Events & Media Management</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <Link
            to="/events-media-add"
            className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
            Add New
          </Link>
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ color: "black" }}>S.No</th>
                <th scope="col" style={{ color: "black" }}>Image</th>
                <th scope="col" style={{ color: "black" }}>Event Details</th>
                <th scope="col" style={{ color: "black" }}>Date/Time</th>
                <th scope="col" style={{ color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-24">Loading...</td>
                </tr>
              ) : records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={record._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      {record.image && (
                        <img
                          src={`${IMAGE_BASE_URL}/${record.image.path}`}
                          alt={record.title}
                          className="w-40-px h-40-px rounded-circle object-fit-cover"
                        />
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-md mb-0 fw-bold text-secondary-light">
                          {record.title}
                        </span>
                        <span className="text-sm text-secondary-light">
                          {record.location || record.venue}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-sm text-secondary-light">
                         {formatDate(record.date)}
                        </span>
                        <span className="text-xs text-secondary-light">
                          {record.startTime} - {record.endTime}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        <Link
                          to={`/events-media-edit/${record._id}`}
                          className="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon icon="lucide:edit" className="menu-icon text-xl" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(record._id)}
                          className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                        >
                          <Icon icon="lucide:trash-2" className="menu-icon text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-24">No records found.</td>
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
    </div>
  );
};

export default EventsMediaListLayer;
