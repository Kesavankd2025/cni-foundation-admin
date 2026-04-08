import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AttendanceFilter from "./AttendanceFilter";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import MeetingApi from "../Api/MeetingApi";
import { formatDate } from "../helper/DateHelper";

const AttendanceListLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    zone: null,
    region: null,
    chapter: null,
    dateRangeFilter: "month",
    fromDate: "",
    toDate: "",
    month: {
      value: new Date().getMonth() + 1,
      label: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        new Date(),
      ),
    },
    year: {
      value: new Date().getFullYear(),
      label: new Date().getFullYear().toString(),
    },
    // type: null,
    search: "",
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage, rowsPerPage, filters]);

  const fetchAttendanceData = async () => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        zoneId: filters.zone?.value,
        regionId: filters.region?.value,
        chapterId: filters.chapter?.value,
        // type: filters.type?.value,
        search: filters.search,
        dateRangeFilter: filters.dateRangeFilter,
      };

      if (filters.dateRangeFilter === "month") {
        params.month = filters.month?.value;
        params.year = filters.year?.value;
      } else if (filters.dateRangeFilter === "custom") {
        params.fromDate = filters.fromDate;
        params.toDate = filters.toDate;
      }

      const response = await MeetingApi.getAttendanceList(params);
      if (response.status) {
        setData(response?.response?.data);
        setTotalRecords(response?.response?.total);
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setData([]);
      setTotalRecords(0);
    }
  };

  const handleFilterChange = (name, selectedOption) => {
    setFilters((prev) => ({ ...prev, [name]: selectedOption }));
    setCurrentPage(0); // Reset to first page on filter change
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      zone: null,
      region: null,
      chapter: null,
      dateRangeFilter: "month",
      fromDate: "",
      toDate: "",
      month: {
        value: new Date().getMonth() + 1,
        label: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          new Date(),
        ),
      },
      year: {
        value: new Date().getFullYear(),
        label: new Date().getFullYear().toString(),
      },
      // type: null,
      search: "",
    });
    setCurrentPage(0);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <AttendanceFilter
        filters={filters}
        setFilters={setFilters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ color: "black" }}>
                  S.No
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Zone
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Region
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Date
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Chapter
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black" }}
                >
                  Total Members
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black" }}
                >
                  Present
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black" }}
                >
                  Absent
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black" }}
                >
                  Proxy
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Meeting Topic
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((meeting, index) => (
                  <tr key={meeting._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{meeting.zoneNames?.join(", ") || "-"}</td>
                    <td>{meeting.regionNames?.join(", ") || "-"}</td>
                    <td>{formatDate(meeting.meetingDate)}</td>
                    <td>{meeting.chapterNames?.join(", ") || "-"}</td>
                    <td className="text-center">{meeting.totalMembers}</td>
                    <td className="text-center text-success-main fw-semibold">
                      <span className="bg-success-focus text-success-main px-8 py-4 radius-4 fw-medium text-sm">
                        {meeting.presentCount}
                      </span>
                    </td>
                    <td className="text-center text-danger-main fw-semibold">
                      <span className="bg-danger-focus text-danger-main px-8 py-4 radius-4 fw-medium text-sm">
                        {meeting.absentCount}
                      </span>
                    </td>
                    <td className="text-center text-danger-main fw-semibold">
                      <span className="bg-danger-focus text-danger-main px-8 py-4 radius-4 fw-medium text-sm">
                        {meeting.proxyCount || 0}
                      </span>
                    </td>
                    <td>{meeting.meetingTopic}</td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(`/meeting-attendance/${meeting._id}`)
                        }
                        className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                      >
                        <Icon
                          icon="majesticons:eye-line"
                          className="icon text-xl"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No records found
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
  );
};

export default AttendanceListLayer;
