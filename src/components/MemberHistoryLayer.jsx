import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MeetingApi from "../Api/MeetingApi";
import { formatDate } from "../helper/DateHelper";
import TablePagination from "./TablePagination";

const MemberHistoryLayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalPresent: 0,
    totalAbsent: 0,
  });
  const [memberName, setMemberName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchHistoryData();
  }, [id]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await MeetingApi.getAttendanceHistoryByMember(id);
      if (response.status) {
        const data = response.response.data;
        setMemberName(data.member?.name || "");
        setStats(
          data.stats || { totalMeetings: 0, totalPresent: 0, totalAbsent: 0 },
        );
        setHistoryData(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = historyData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const paginatedHistory = historyData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-24">
          <h6 className="text-primary-600 pb-2 mb-0">
            {memberName} Attendance History
          </h6>
          <button
            onClick={() => navigate(-1)}
            className="btn-ash"
            title="Back"
          >
            <Icon icon="solar:arrow-left-linear" width="18" />
            Back to List
          </button>
        </div>

        <div className="row g-3">
          <div className="col-lg-4 col-sm-6">
            <div className="p-16 radius-8 border d-flex align-items-center gap-3 bg-primary-50">
              <span className="w-48-px h-48-px radius-8 bg-primary-600 text-white d-flex justify-content-center align-items-center text-2xl">
                <Icon icon="lucide:calendar-check" />
              </span>
              <div>
                <h6 className="mb-0">{stats.totalMeetings}</h6>
                <span className="text-secondary-light">Total Meetings</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <div className="p-16 radius-8 border d-flex align-items-center gap-3 bg-success-50">
              <span className="w-48-px h-48-px radius-8 bg-success-600 text-white d-flex justify-content-center align-items-center text-2xl">
                <Icon icon="lucide:check-circle" />
              </span>
              <div>
                <h6 className="mb-0">{stats.totalPresent}</h6>
                <span className="text-secondary-light">Total Present</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <div className="p-16 radius-8 border d-flex align-items-center gap-3 bg-danger-50">
              <span className="w-48-px h-48-px radius-8 bg-danger-600 text-white d-flex justify-content-center align-items-center text-2xl">
                <Icon icon="lucide:x-circle" />
              </span>
              <div>
                <h6 className="mb-0">{stats.totalAbsent}</h6>
                <span className="text-secondary-light">Total Absent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body p-24">
        <h6 className="text-primary-600 pb-2 mb-3">Detailed History</h6>
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Date</th>
                <th scope="col">Chapter</th>
                <th scope="col">Meeting Type</th>
                <th scope="col" className="text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    Loading...
                  </td>
                </tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.chapterName}</td>
                    <td>{item.meetingType}</td>
                    <td className="text-center">
                      <span
                        className={`px-24 py-4 rounded-pill fw-medium text-sm ${item.status?.toLowerCase() === "present" ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-24 pb-24 border-top pt-20">
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
    </div>
  );
};

export default MemberHistoryLayer;
