import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import TablePagination from "./TablePagination";
import ReportApi from "../Api/ReportApi";
import ChapterApi from "../Api/ChapterApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import usePermissions from "../hook/usePermissions";
import { formatDateTime } from "../helper/DateHelper";
import { formatLabel } from "../helper/TextHelper";
// import StandardDatePicker from "./StandardDatePicker";
import ShowNotifications from "../helper/ShowNotifications";

const Note121Layer = () => {
  const { hasPermission } = usePermissions();
  const [reports, setReports] = useState({ data: [], total: 0, from: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filter States
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEd, setSelectedEd] = useState(null);
  const [selectedRd, setSelectedRd] = useState(null);
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
    fetchInitialOptions();
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
    fetchReports();
  }, [
    currentPage,
    rowsPerPage,
    searchTerm,
    selectedChapter,
    selectedZone,
    selectedEd,
    selectedRd,
  ]);

  const fetchInitialOptions = async () => {
    try {
      const zonesRes = await ZoneApi.getZone();

      if (zonesRes.status) {
        const zones = Array.isArray(zonesRes.response.data)
          ? zonesRes.response.data
          : [];
        setZoneOptions(zones.map((z) => ({ value: z._id, label: z.name })));
      }
    } catch (error) {
      console.error("Error fetching initial options:", error);
    }
  };

  const fetchChapters = async (zoneId) => {
    console.log("zoneId", zoneId);
    try {
      const params = zoneId ? { zoneId } : {};
      const res = await ChapterApi.getChapter(params);
      if (res.status) {
        const chapters = Array.isArray(res.response.data)
          ? res.response.data
          : res.response.data.docs || [];
        setChapterOptions(
          chapters.map((c) => ({ value: c._id, label: c.chapterName })),
        );
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const fetchRoleBasedUsers = async (zoneId, chapterId) => {
    try {
      const [edRes, rdRes] = await Promise.all([
        RegionApi.getRoleBasedUser("ED", zoneId, chapterId),
        RegionApi.getRoleBasedUser("RD", zoneId, chapterId),
      ]);

      if (edRes.status) {
        const eds = Array.isArray(edRes.response.data)
          ? edRes.response.data
          : [];
        setEdOptions(
          eds.map((u) => ({ value: u._id, label: u.name || u.roleName })),
        );
      } else {
        setEdOptions([]);
      }

      if (rdRes.status) {
        const rds = Array.isArray(rdRes.response.data)
          ? rdRes.response.data
          : [];
        setRdOptions(
          rds.map((u) => ({ value: u._id, label: u.name || u.roleName })),
        );
      } else {
        setRdOptions([]);
      }
    } catch (error) {
      console.error("Error fetching role based users:", error);
    }
  };

  const fetchReports = async () => {
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
      };

      const res = await ReportApi.getOneToOneReport(params);
      if (res.status) {
        setReports(res.response || { data: [], total: 0, from: 0 });
      }
    } catch (error) {
      console.error("Error fetching 121 reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil((reports.total || 0) / rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleViewImage = (report) => {
    setSelectedReport(report);
    setShowImageModal(true);
  };

  const handleClearFilters = () => {
    setSelectedChapter(null);
    setSelectedZone(null);
    setSelectedEd(null);
    setSelectedRd(null);
    setSearchTerm("");
    setCurrentPage(0);
  };

  /*
  const handleExcelDateChange = (e) => {
    const { name, value } = e.target;
    setExcelDates((prev) => ({ ...prev, [name]: value }));
    // Clear error when user selects a date
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
      };

      const res = await ReportApi.excelOneToOneReport(payload);

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
        // a.download = `OneToOne_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
        a.download = `OneToOne_Report.${extensions[format] || "csv"}`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        ShowNotifications.showAlertNotification(
          res.message || "Report downloaded successfully.",
          true
        );
        handleCloseExcel();
      } else {
        ShowNotifications.showAlertNotification(
          res.message || "Failed to download report.",
          false
        );
      }
    } catch (err) {
      console.error(err);
      ShowNotifications.showAlertNotification(
        err.response?.data?.message || err.message || "Something went wrong while downloading the report.",
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

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <h6 className="text-primary-600 pb-2 mb-0">121's Report</h6>
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
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 align-items-end">
          <div className="col-xl col-md-4 col-sm-6">
            <Select
              options={zoneOptions}
              value={selectedZone}
              onChange={(opt) => {
                setSelectedZone(opt);
                setCurrentPage(0);
              }}
              placeholder="Zone"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
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
            <Select
              options={edOptions}
              value={selectedEd}
              onChange={(opt) => {
                setSelectedEd(opt);
                setCurrentPage(0);
              }}
              placeholder="ED"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <Select
              options={rdOptions}
              value={selectedRd}
              onChange={(opt) => {
                setSelectedRd(opt);
                setCurrentPage(0);
              }}
              placeholder="RD"
              styles={selectStyles()}
              isClearable
            />
          </div>
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
                <th scope="col">S.No</th>
                <th scope="col">Date & Time</th>
                <th scope="col">Member Name</th>
                <th scope="col">Met with</th>
                <th scope="col">Initiated by</th>
                <th scope="col">Location</th>
                <th scope="col">Topics</th>
                <th scope="col" className="text-center">
                  Selfie (View)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.data && reports.data.length > 0 ? (
                reports.data.map((report, index) => (
                  <tr key={report._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{formatDateTime(report.meetingDateTime)}</td>
                    <td>{report.memberName}</td>
                    <td>{report.metWithName}</td>
                    <td>{formatLabel(report.initiatedBy)}</td>
                    <td>{report.meetingLocation || "-"}</td>
                    <td>
                      {(() => {
                        const topic = report.topicDiscussed || "-";
                        if (topic.length > 25) {
                          return (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id={`tooltip-topic-${report._id}`}>{topic}</Tooltip>}
                            >
                              <span style={{ cursor: "pointer" }}>
                                {topic.substring(0, 25)}...
                              </span>
                            </OverlayTrigger>
                          );
                        }
                        return topic;
                      })()}
                    </td>
                    <td className="text-center">
                      {hasPermission("121's Report", "view") && (
                        <button
                          onClick={() => handleViewImage(report)}
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        >
                          <Icon icon="majesticons:eye-line" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="mt-24">
            {hasPermission("121's Report", "view") && (
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
              totalRecords={reports.total || 0}
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
                  className={`form-control radius-8 ${excelErrors.toDate ? 'border-danger' : ''}`}
                />
                {excelErrors.toDate && (
                  <span className="text-danger text-xs mt-1 d-block">{excelErrors.toDate}</span>
                )}
              </div>
              */}
              {(selectedZone || selectedChapter) && (
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
                      {selectedEd && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-8 fw-medium w-64-px">ED:</span>
                          <span className="text-primary-light fontsize-8 fw-semibold">{selectedEd.label}</span>
                        </div>
                      )}
                      {selectedRd && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-12 fw-medium w-64-px">RD:</span>
                          <span className="text-primary-light fontsize-12 fw-semibold">{selectedRd.label}</span>
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

      {/* Selfie Modal */}
      <Modal
        centered
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        contentClassName="radius-16 border-0"
        size="lg"
      >
        <Modal.Header className="py-12 px-16 border-bottom border-neutral-200">
          <Modal.Title className="fw-medium text-primary-600" style={{ fontSize: "30px !important" }}>
            121's Details
          </Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowImageModal(false)}
          ></button>
        </Modal.Header>
        <Modal.Body className="p-16">
          {selectedReport && (
            <div className="d-flex flex-column gap-16">

              {/* Top Details Section */}
              <div className="row g-3">
                {/* Member Name */}
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-8">
                    <span className="bg-primary-50 text-primary-600 w-32-px h-32-px radius-circle d-flex justify-content-center align-items-center flex-shrink-0">
                      <Icon icon="solar:user-bold-duotone" className="text-lg" />
                    </span>
                    <div>
                      <span className="text-secondary-light fontsize-10 d-block">Member</span>
                      <p className="fontsize-11 fw-medium text-primary-light mb-0">{selectedReport.memberName}</p>
                    </div>
                  </div>
                </div>

                {/* Met With */}
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-8">
                    <span className="bg-success-50 text-success-600 w-32-px h-32-px radius-circle d-flex justify-content-center align-items-center flex-shrink-0">
                      <Icon icon="solar:user-check-bold-duotone" className="text-lg" />
                    </span>
                    <div>
                      <span className="text-secondary-light fontsize-10 d-block">Met With</span>
                      <p className="fontsize-11 fw-medium text-primary-light mb-0">{selectedReport.metWithName}</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-8">
                    <span className="bg-info-50 text-info-600 w-32-px h-32-px radius-circle d-flex justify-content-center align-items-center flex-shrink-0">
                      <Icon icon="solar:calendar-date-bold-duotone" className="text-lg" />
                    </span>
                    <div>
                      <span className="text-secondary-light fontsize-10 d-block">Date</span>
                      <p className="fontsize-11 fw-medium text-primary-light mb-0">{formatDateTime(selectedReport.meetingDateTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-8">
                    <span className="bg-warning-50 text-warning-600 w-32-px h-32-px radius-circle d-flex justify-content-center align-items-center flex-shrink-0">
                      <Icon icon="solar:map-point-bold-duotone" className="text-lg" />
                    </span>
                    <div>
                      <span className="text-secondary-light fontsize-10 d-block">Location</span>
                      <p className="fontsize-11 fw-medium text-primary-light mb-0">{selectedReport.meetingLocation || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-bottom border-neutral-200"></div>

              {/* Discussion Topic */}
              <div>
                <span className="text-secondary-light fontsize-10 mb-4 d-block fw-medium">
                  Discussion Topic
                </span>
                <div className="p-12 radius-8 bg-neutral-50 border border-neutral-200">
                  <p className="mb-0 text-primary-light fontsize-11 fw-normal">
                    {selectedReport.topicDiscussed || "No topic recorded."}
                  </p>
                </div>
              </div>

              {/* Selfie Image */}
              <div>
                <span className="text-secondary-light fontsize-10 mb-4 d-block fw-medium">
                  Shared Selfie
                </span>
                <div
                  className="radius-8 overflow-hidden border border-neutral-200 bg-neutral-50 d-flex justify-content-center align-items-center"
                  style={{ minHeight: "150px" }}
                >
                  {selectedReport.photos && selectedReport.photos[0] ? (
                    <img
                      src={`${IMAGE_BASE_URL}/${selectedReport.photos[0].path}`}
                      alt="Selfie"
                      className="w-100 h-auto object-fit-contain"
                      style={{ maxHeight: "250px" }}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="text-center py-20">
                      <Icon
                        icon="solar:camera-broken-bold-duotone"
                        className="text-neutral-400 text-6xl mb-12"
                      />
                      <p className="text-secondary-light mb-0">
                        No selfie available
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top border-neutral-200 py-10 px-16">
          <Button
            variant="secondary"
            className="btn btn-secondary py-8 px-24 radius-8 fw-medium fontsize-12"
            onClick={() => setShowImageModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Note121Layer;
