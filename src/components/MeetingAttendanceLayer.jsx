import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MeetingApi from "../Api/MeetingApi";
import TablePagination from "./TablePagination";

const MeetingAttendanceLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
    fetchMeetingDetails();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await MeetingApi.getAttendanceListBySource({
        sourceId: id,
        sourceType: "MEETING",
        limit: 10000,
      });
      if (response.status) {
        setAttendanceData(response.response.data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingDetails = async () => {
    try {
      const response = await MeetingApi.getMeeting({ id });
      if (response.status) {
        setMeetingDetails(response.response);
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    }
  };

  const getChapterName = () => {
    if (meetingDetails?.chapterNames)
      return meetingDetails.chapterNames.join(", ");
    return "";
  };

  const filteredAttendance = attendanceData.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      (item.memberName || "").toLowerCase().includes(search) ||
      (item.memberMobile || "").toLowerCase().includes(search) ||
      (item.companyName || "").toLowerCase().includes(search) ||
      (item.categoryName || "").toLowerCase().includes(search)
    );
  });

  const totalRecords = filteredAttendance.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
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
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">
          {getChapterName()
            ? `${getChapterName()} Attendance List`
            : "Attendance List"}
        </h6>

        <div className="d-flex align-items-center gap-3">
          <form
            className="navbar-search mr-0"
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
          <button
            onClick={() => navigate(-1)}
            className="btn-ash"
            title="Back"
          >
            <Icon icon="solar:arrow-left-linear" width="18" />
            Back to List
          </button>
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Name</th>
                <th scope="col">Mobile Number</th>
                <th scope="col">Company Name</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-center">
                  Status
                </th>
                <th scope="col" className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    Loading...
                  </td>
                </tr>
              ) : paginatedAttendance.length > 0 ? (
                paginatedAttendance.map((item, index) => (
                  <tr key={item._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{item.memberName}</td>
                    <td>{item.memberMobile}</td>
                    <td>{item.companyName}</td>
                    <td>{item.categoryName}</td>
                    <td className="text-center">
                      <span
                        className={`px-24 py-4 rounded-pill fw-medium text-sm text-capitalize ${item.status?.toLowerCase() === "present" ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}
                      >
                        {item.status?.toLowerCase()}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          navigate(`/member-history/${item.memberId}`)
                        }
                        className="btn btn-warning-600 btn-sm radius-8 px-12 py-6 d-flex align-items-center gap-2 mx-auto"
                      >
                        <Icon icon="lucide:history" />
                        History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-3">
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

export default MeetingAttendanceLayer;
