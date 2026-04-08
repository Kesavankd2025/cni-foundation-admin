import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Spinner } from "react-bootstrap";
import TablePagination from "./TablePagination";
import LogReportApi from "../Api/LogReportApi";
import { formatDate, formatTime } from "../helper/DateHelper";

const LogReportLayer = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("WEB");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchReports();
  }, [activeTab, currentPage, rowsPerPage, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        loginfrom: activeTab,
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      };
      const result = await LogReportApi.getLoginReports(params);
      if (result.status) {
        setReports(result.response.data || []);
        setTotalRecords(result.response.total || 0);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  function renderTable(items) {
    return (
      <div className="table-responsive scroll-sm">
        <table className="table bordered-table sm-table mb-0">
          <thead>
            <tr>
              <th scope="col" style={{ color: "white" }}>
                S.No
              </th>
              <th scope="col" style={{ color: "white" }}>
                User Name
              </th>
              <th scope="col" style={{ color: "white" }}>
                Phone Number
              </th>
              <th scope="col" style={{ color: "white" }}>
                Location
              </th>
              <th scope="col" style={{ color: "white" }}>
                Device Name
              </th>
              <th scope="col" style={{ color: "white" }}>
                Login Date
              </th>
              <th scope="col" style={{ color: "white" }}>
                Login Time
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-24">
                  <Spinner animation="border" variant="danger" />
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item, index) => {
                const loginDate = formatDate(item.loginAt);
                const loginTime = formatTime(item.loginAt);
                return (
                  <tr key={item._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{item.userName}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{item.currentLocation}</td>
                    <td>{item.deviceName}</td>
                    <td>{loginDate}</td>
                    <td>{loginTime}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-24">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Log Report</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search" onClick={(e) => e.preventDefault()}>
            <input
              type="text"
              className="form-control bg-base h-40-px w-auto"
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
        </div>
      </div>
      <div className="card-body p-24">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => {
            setActiveTab(k);
            setCurrentPage(0);
          }}
          className="mb-3 custom-tabs"
        >
          <Tab eventKey="WEB" title="Web Login">
            {renderTable(reports)}
          </Tab>
          <Tab eventKey="MOBILE" title="Mobile Login">
            {renderTable(reports)}
          </Tab>
        </Tabs>

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

export default LogReportLayer;
