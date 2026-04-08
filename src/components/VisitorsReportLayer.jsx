import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { modal, Modal, Button } from "react-bootstrap";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import ReportApi from "../Api/ReportApi";
import ChapterApi from "../Api/ChapterApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import usePermissions from "../hook/usePermissions";
import { formatDate, getLocalDateForInput } from "../helper/DateHelper";
import ShowNotifications from "../helper/ShowNotifications";
import StandardDatePicker from "./StandardDatePicker";

const VisitorsReportLayer = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [visitors, setVisitors] = useState({ data: [], total: 0, from: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter States
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEd, setSelectedEd] = useState(null);
  const [selectedRd, setSelectedRd] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelDates, setExcelDates] = useState({
    // fromDate: "",
    // toDate: "",
    format: { value: "csv", label: "Excel" },
  });
  // const [excelErrors, setExcelErrors] = useState({
  //   fromDate: "",
  //   toDate: "",
  // });
  const [excelErrors, setExcelErrors] = useState({});

  // Options
  const [chapterOptions, setChapterOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [edOptions, setEdOptions] = useState([]);
  const [rdOptions, setRdOptions] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchChapters(selectedZone.value);
    } else {
      fetchChapters();
    }
    fetchRoleBasedUsers(selectedZone?.value, selectedChapter?.value);
  }, [selectedZone]);

  useEffect(() => {
    fetchRoleBasedUsers(selectedZone?.value, selectedChapter?.value);
  }, [selectedChapter]);

  useEffect(() => {
    fetchVisitors();
  }, [
    currentPage,
    rowsPerPage,
    searchTerm,
    selectedChapter,
    selectedZone,
    selectedEd,
    selectedRd,
    fromDate,
    toDate,
  ]);

  const fetchFilterOptions = async () => {
    try {
      // fetchChapters(); // Handled by selectedZone effect
      const zonesRes = await ZoneApi.getZone();

      if (zonesRes.status) {
        setZoneOptions(
          zonesRes.response.data.map((z) => ({ value: z._id, label: z.name })),
        );
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchChapters = async (zoneId) => {
    try {
      const params = zoneId ? { zoneId } : {};
      const res = await ChapterApi.getChapter(params);
      if (res.status) {
        setChapterOptions(
          res.response.data.map((c) => ({
            value: c._id,
            label: c.chapterName,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const fetchRoleBasedUsers = async (zoneId, chapterId) => {
    try {
      const [edRes, rdRes] = await Promise.all([
        RegionApi.getRoleBasedUser("ed", zoneId, chapterId),
        RegionApi.getRoleBasedUser("rd", zoneId, chapterId),
      ]);

      if (edRes.status) {
        setEdOptions(
          edRes.response.data.map((u) => ({ value: u._id, label: u.name })),
        );
      } else {
        setEdOptions([]);
      }

      if (rdRes.status) {
        setRdOptions(
          rdRes.response.data.map((u) => ({ value: u._id, label: u.name })),
        );
      } else {
        setRdOptions([]);
      }
    } catch (error) {
      console.error("Error fetching role based users:", error);
    }
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        chapterId: selectedChapter?.value || "",
        zoneId: selectedZone?.value || "",
        edId: selectedEd?.value || "",
        rdId: selectedRd?.value || "",
        fromDate: fromDate ? getLocalDateForInput(fromDate) : "",
        toDate: toDate ? getLocalDateForInput(toDate) : "",
      };

      const res = await ReportApi.getVisitorReport(params);
      if (res.status) {
        setVisitors(res.response || { data: [], total: 0, from: 0 });
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = visitors.total || 0;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedChapter(null);
    setSelectedZone(null);
    setSelectedEd(null);
    setSelectedRd(null);
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setCurrentPage(0);
  };

  /*
  const handleExcelDateChange = (e) => {
    const { name, value } = e.target;
    setExcelDates((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setExcelErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  */

  const handleExcelSubmit = async (e) => {
    e.preventDefault();

    /*
    const errors = {};
    if (!excelDates.fromDate) errors.fromDate = "From Date is required";
    if (!excelDates.toDate) errors.toDate = "To Date is required";

    if (Object.keys(errors).length > 0) {
      setExcelErrors(errors);
      return;
    }
    */

    try {
      setLoading(true);

      /*
      const formatDateForPayload = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const formattedDates = {
        fromDate: formatDateForPayload(excelDates.fromDate),
        toDate: formatDateForPayload(excelDates.toDate),
        format: excelDates.format?.value || "csv",
        search: searchTerm,
        chapterId: selectedChapter?.value || "",
        zoneId: selectedZone?.value || "",
        edId: selectedEd?.value || "",
        rdId: selectedRd?.value || "",
      };
      */

      const payload = {
        format: excelDates.format?.value || "csv",
        search: searchTerm,
        chapterId: selectedChapter?.value || "",
        zoneId: selectedZone?.value || "",
        edId: selectedEd?.value || "",
        rdId: selectedRd?.value || "",
        fromDate: fromDate ? getLocalDateForInput(fromDate) : "",
        toDate: toDate ? getLocalDateForInput(toDate) : "",
      };

      const res = await ReportApi.excelVisitorReport(payload);

      if (res.status && res.data) {
        const format = payload.format;
        const mimeTypes = {
          csv: "text/csv;charset=utf-8;",
          excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          pdf: "application/pdf",
        };

        const extensions = {
          csv: "csv",
          excel: "xlsx",
          pdf: "pdf",
        };

        const blob = new Blob([res.data], {
          type: mimeTypes[format] || mimeTypes.csv,
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        // a.download = `Visitor_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
        a.download = `Visitor_Report.${extensions[format] || "csv"}`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        ShowNotifications.showAlertNotification(
          res.message || res.data?.message || "Report downloaded successfully.",
          true
        );
        handleCloseExcel();
      } else {
        ShowNotifications.showAlertNotification(
          res.message || res.error?.data?.message || "Failed to download report.",
          false
        );
      }
    } catch (err) {
      console.error(err);
      ShowNotifications.showAlertNotification(
        err?.response?.data?.message || err?.message || "Something went wrong while downloading the report.",
        false
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseExcel = () => {
    setShowExcelModal(false);
    setExcelDates({
      // fromDate: "",
      // toDate: "",
      format: { value: "csv", label: "Excel" },
    });
    // setExcelErrors({
    //   fromDate: "",
    //   toDate: "",
    // });
    setExcelErrors({});
  };

  const handleStatusChange = (id, newStatus) => {
    console.log("Status change requested:", id, newStatus);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <h6 className="text-primary-600 pb-2 mb-0">Visitor's Report</h6>
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
            {/* <button
              type="button"
              onClick={() => navigate("/visitors-form")}
              className="btn btn-primary-600 d-flex align-items-center gap-2 radius-8 h-40-px text-nowrap"
            >
              <Icon icon="solar:add-circle-bold-duotone" fontSize={20} />
              Add Visitor
            </button> */}
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 align-items-end">
          <div className="col-xl col-md-4 col-sm-6">
            <label className="form-label fw-bold text-secondary-light">
              Zone
            </label>
            <Select
              options={zoneOptions}
              value={selectedZone}
              onChange={(opt) => {
                setSelectedZone(opt);
                setCurrentPage(0);
              }}
              placeholder="Select Zone"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <label className="form-label fw-bold text-secondary-light">
              Chapter
            </label>
            <Select
              options={chapterOptions}
              value={selectedChapter}
              onChange={(opt) => {
                setSelectedChapter(opt);
                setCurrentPage(0);
              }}
              placeholder="Chapter"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <label className="form-label fw-bold text-secondary-light">
              From Date
            </label>
            <StandardDatePicker
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="From Date"
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <label className="form-label fw-bold text-secondary-light">
              To Date
            </label>
            <StandardDatePicker
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="To Date"
              minDate={fromDate}
            />
          </div>
          {/* <div className="col-xl col-md-4 col-sm-6">
            <label className="form-label fw-bold text-secondary-light">
              ED
            </label>
            <Select
              options={edOptions}
              value={selectedEd}
              onChange={(opt) => {
                setSelectedEd(opt);
                setCurrentPage(0);
              }}
              placeholder="Select ED"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <label className="form-label fw-bold text-secondary-light">
              RD
            </label>
            <Select
              options={rdOptions}
              value={selectedRd}
              onChange={(opt) => {
                setSelectedRd(opt);
                setCurrentPage(0);
              }}
              placeholder="Select RD"
              styles={selectStyles()}
              isClearable
            />
          </div> */}
          <div className="col-xl-auto col-md-4 col-sm-6 d-flex align-items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-outline-danger d-flex align-items-center gap-2 radius-8 h-40-px text-nowrap w-100"
              title="Clear All Filters"
            >
              <Icon icon="solar:filter-remove-bold-duotone" fontSize={20} />
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  S.No
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Date
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Chapter
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Visitors Name
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Phone Number
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Business Category
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Business Name
                </th>
                {/* <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Source of event
                </th> */}
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Invited By
                </th>
                {/* <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Status
                </th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : visitors.data && visitors.data.length > 0 ? (
                visitors.data.map((visitor, index) => (
                  <tr key={visitor._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{formatDate(visitor.date || visitor.visitDate)}</td>
                    <td>{visitor.chapterName || visitor.chapterId?.chapterName || "N/A"}</td>
                    <td>{visitor.visitorName || "N/A"}</td>
                    <td>{visitor.contactNumber || visitor.phone || "N/A"}</td>
                    <td>
                      {visitor.businessCategory || visitor.category || "N/A"}
                    </td>
                    <td>{visitor.companyName || visitor.company || "N/A"}</td>
                    {/* <td>
                      {visitor.sourceOfEvent
                        ? visitor.sourceOfEvent.charAt(0).toUpperCase() +
                        visitor.sourceOfEvent.slice(1).toLowerCase()
                        : "N/A"}
                    </td> */}
                    <td>{visitor.invitedBy || "N/A"}</td>
                    {/* <td>
                      <span
                        className={`badge ${visitor.status === "Approved"
                          ? "bg-success-focus text-success-main"
                          : visitor.status === "Rejected"
                            ? "bg-danger-focus text-danger-main"
                            : "bg-warning-focus text-warning-main"
                          } px-8 py-4 radius-4`}
                      >
                        {visitor.status || "Pending"}
                      </span>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No visitors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="mt-24">
            {hasPermission("Visitor's Report", "view") && visitors.data && visitors.data.length > 0 && (
              <button
                type="button"
                className="btn btn-primary radius-8 px-20 py-11 d-flex align-items-center gap-2"
                onClick={() => setShowExcelModal(true)}

              >
                <Icon icon="lucide:download" className="text-xl" />
                Report
              </button>
            )}
          </div>
          <div className="flex-grow-1">
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

      {/* Excel Download Modal */}
      <Modal
        centered
        show={showExcelModal}
        onHide={handleCloseExcel}
        contentClassName="radius-16 border-0"
      >
        <Modal.Header className="py-12 px-16 border-bottom border-neutral-200" style={{ backgroundColor: "#FFF5F5" }}>
          <h6 className="fontsize-14 fw-bold mb-0" style={{ color: "#003366" }}>
            Download Report
          </h6>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseExcel}
          ></button>
        </Modal.Header>
        <Modal.Body className="p-24">
          <form onSubmit={handleExcelSubmit}>
            <div className="row gy-4">
              {/* OLD DATE FIELDS
              <div className="col-12">
                <label className="form-label fw-bold">From Date</label>
                <StandardDatePicker
                  name="fromDate"
                  value={excelDates.fromDate}
                  onChange={handleExcelDateChange}
                  className={`form-control radius-8 ${excelErrors.fromDate ? 'border-danger' : ''}`}
                />
                {excelErrors.fromDate && (
                  <span className="text-danger text-xs mt-1 d-block">{excelErrors.fromDate}</span>
                )}
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">To Date</label>
                <StandardDatePicker
                  name="toDate"
                  value={excelDates.toDate}
                  onChange={handleExcelDateChange}
                  minDate={excelDates.fromDate || undefined}
                  className={`form-control radius-8 ${excelErrors.toDate ? 'border-danger' : ''}`}
                />
                {excelErrors.toDate && (
                  <span className="text-danger text-xs mt-1 d-block">{excelErrors.toDate}</span>
                )}
              </div>
              */}
              {(selectedZone || selectedChapter || selectedRd || selectedEd) && (
                <div className="col-12">
                  <div className="p-16 bg-neutral-50 radius-8 border border-neutral-200">
                    <p className="fontsize-14 fw-bold mb-12">Selected Filters</p>
                    <div className="d-flex flex-column gap-8">
                      {selectedZone && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-8 fw-medium w-64-px">Zone:</span>
                          <span className="text-primary-light fontsize-8 fw-semibold">{selectedZone.label}</span>
                        </div>
                      )}
                      {selectedChapter && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-8 fw-medium w-64-px">Chapter:</span>
                          <span className="text-primary-light fontsize-8 fw-semibold">{selectedChapter.label}</span>
                        </div>
                      )}
                      {selectedRd && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-8 fw-medium w-64-px">RD:</span>
                          <span className="text-primary-light fontsize-8 fw-semibold">{selectedRd.label}</span>
                        </div>
                      )}
                      {selectedEd && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-8 fw-medium w-64-px">ED:</span>
                          <span className="text-primary-light fontsize-8 fw-semibold">{selectedEd.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="col-12">
                <label className="form-label fw-bold">Format</label>
                <Select
                  options={[
                    { value: "csv", label: "Excel" },
                    // { value: "excel", label: "Excel" },
                    { value: "pdf", label: "PDF" },
                  ]}
                  value={excelDates.format}
                  onChange={(opt) =>
                    setExcelDates((prev) => ({ ...prev, format: opt }))
                  }
                  styles={selectStyles()}
                  placeholder="Select Format"
                />
              </div>
              <div className="col-12 mt-5 pt-2">
                <Button
                  type="submit"
                  className="w-100 py-12 radius-8 fw-bold btn-primary"

                >
                  Download
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VisitorsReportLayer;
