import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import ReportApi from "../Api/ReportApi";
import ChapterApi from "../Api/ChapterApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import usePermissions from "../hook/usePermissions";
import { formatDate } from "../helper/DateHelper";
// import StandardDatePicker from "./StandardDatePicker";
import ShowNotifications from "../helper/ShowNotifications";

const ReferralNoteLayer = () => {
  const { hasPermission } = usePermissions();
  const [referrals, setReferrals] = useState({ data: [], total: 0, from: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

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
    fetchReferrals();
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
      fetchChapters();
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

  const fetchReferrals = async () => {
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

      const res = await ReportApi.getReferralReport(params);
      if (res.status) {
        setReferrals(res.response || { data: [], total: 0, from: 0 });
      }
    } catch (error) {
      console.error("Error fetching referral reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil((referrals.total || 0) / rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "GOT_BUSINESS":
        return "bg-success-focus text-success-main";
      case "NOT_CONTACTED":
        return "bg-warning-focus text-warning-main";
      case "CONTACTED":
        return "bg-info-focus text-info-main";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ").toUpperCase();
  };

  const getTempStyle = (temp) => {
    // Normalizing case just in case the backend returns different casing
    const normalizedTemp = temp ? temp.charAt(0).toUpperCase() + temp.slice(1).toLowerCase() : temp;
    switch (normalizedTemp) {
      case "Hot":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "High":
        return { bg: "#fff7ed", text: "#c2410c" };
      case "Bright":
        return { bg: "#fef9c3", text: "#854d0e" };
      case "Scope":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "Base":
        return { bg: "#f3e8ff", text: "#9333ea" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
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

      const res = await ReportApi.excelReferralReport(payload);

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
        // a.download = `Referral_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
        a.download = `Referral_Report.${extensions[format] || "csv"}`;
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

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowViewModal(true);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <h6 className="text-primary-600 pb-2 mb-0">Referral's Report</h6>
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
                <th scope="col">Date</th>
                <th scope="col">Member Name</th>
                <th scope="col">Referral To</th>
                <th scope="col">Type</th>
                <th scope="col">Referral Name</th>
                <th scope="col">Business Potential</th>
                <th scope="col">Status</th>
                <th scope="col">Comments</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : referrals.data && referrals.data.length > 0 ? (
                referrals.data.map((item, index) => (
                  <tr key={item._id}>
                    <td>{(currentPage * rowsPerPage) + index + 1}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{item.memberName}</td>
                    <td>{item.referralTo}</td>
                    <td>
                      <span
                        className={`badge ${item.type === "INSIDE" ? "bg-primary-50 text-primary-600" : "bg-neutral-200 text-neutral-600"} px-8 py-4 radius-4`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td>{item.referralName}</td>
                    <td className="fw-bold">
                      <span
                        className="badge px-8 py-4 radius-4"
                        style={{
                          backgroundColor: getTempStyle(item.temp).bg,
                          color: getTempStyle(item.temp).text,
                          fontWeight: "bold",
                        }}
                      >
                        {item.temp}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusColor(item.status)} px-8 py-4 radius-4`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td style={{ minWidth: "200px" }}>{item.comments}</td>
                    <td>
                      {hasPermission("Referral's Report", "view") && (
                        <button
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Icon icon="majesticons:eye-line" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No referrals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="mt-24">
            {hasPermission("Referral's Report", "view") && referrals.data && referrals.data.length > 0 && (
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
              totalRecords={referrals.total || 0}
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

      <Modal
        centered
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        className="premium-view-modal"
      >
        <Modal.Header closeButton className="border-bottom bg-base py-16 px-24">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            {/* <div className="bg-primary-50 text-primary-600 p-8 radius-8 d-flex align-items-center justify-content-center">
              <Icon icon="majesticons:eye-line" className="text-xl" />
            </div> */}
            <h6 className="fw-bold text-secondary-light fs-4">
              Referral Details
            </h6>

          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24 bg-base">
          {selectedReferral && (
            <div className="d-flex flex-column gap-24">
              {/* Status Banner */}
              <div className="d-flex align-items-center justify-content-between p-16 radius-12 bg-primary-50 border border-primary-100 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="w-40-px h-40-px radius-circle bg-primary-600 text-white d-flex align-items-center justify-content-center flex-shrink-0">
                    <Icon
                      icon="solar:user-id-bold-duotone"
                      className="text-xl"
                    />
                  </div>
                  <div>
                    <h6 className="text-primary-900 fw-bold mb-0 fs-5">
                      {selectedReferral.referralName}
                    </h6>
                    {/* <span className="text-primary-600 text-sm">
                      Referral Contact
                    </span> */}
                  </div>
                </div>
                <span
                  className={`badge ${getStatusColor(selectedReferral.status)} px-12 py-6 radius-pill text-sm fw-bold border`}
                >
                  {formatStatus(selectedReferral.status)}
                </span>
              </div>

              <div className="row g-4">
                {/* Contact Info */}
                <div className="col-md-6">
                  <div className="card h-100 border border-neutral-200 shadow-sm bg-base">
                    <div className="card-body p-20">
                      <h6 className="fw-bold text-secondary-light mb-20 border-bottom pb-12 d-flex align-items-center gap-2 fs-5">
                        <Icon
                          icon="solar:phone-calling-bold-duotone"
                          className="text-primary-600"
                        />
                        Contact Info
                      </h6>
                      <div className="d-flex flex-column gap-16">
                        <div>
                          <span className="d-block text-secondary-light text-sm mb-4 fs-5">
                            Phone Number
                          </span>
                          <a
                            href={`tel:${selectedReferral.telephone}`}
                            className="text-primary-600 fw-medium hover-text-decoration-underline"
                          >
                            {selectedReferral.telephone || "N/A"}
                          </a>
                        </div>
                        <div>
                          <span className="d-block text-secondary-light text-sm mb-4 fs-5">
                            Email Address
                          </span>
                          <a
                            href={`mailto:${selectedReferral.email}`}
                            className="text-primary-600 fw-medium hover-text-decoration-underline"
                          >
                            {selectedReferral.email || "N/A"}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address & Details */}
                <div className="col-md-6">
                  <div className="card h-100 border border-neutral-200 shadow-sm bg-base">
                    <div className="card-body p-20">
                      <h6 className="fw-bold text-secondary-light mb-20 border-bottom pb-12 d-flex align-items-center gap-2 fs-5">
                        <Icon
                          icon="solar:map-point-bold-duotone"
                          className="text-primary-600"
                        />
                        Location & Type
                      </h6>
                      <div className="d-flex flex-column gap-16">
                        <div>
                          <span className="d-block text-secondary-light text-sm mb-4 fs-5">
                            Address
                          </span>
                          <span className="text-secondary-light fw-medium">
                            {selectedReferral.address || "N/A"}
                          </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <span className="d-block text-secondary-light text-sm mb-4 fs-5">
                              Type
                            </span>
                            <span
                              className={`badge ${selectedReferral.type === "INSIDE" ? "bg-success-focus text-success-main" : "bg-neutral-200 text-neutral-600"} radius-4`}
                            >
                              {selectedReferral.type || "N/A"}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="d-block text-secondary-light text-sm mb-4 fs-5">
                              Bussiness Potential
                            </span>
                            <span
                              className="badge px-8 py-4 radius-4 fw-bold"
                              style={{
                                backgroundColor: getTempStyle(selectedReferral.temp).bg,
                                color: getTempStyle(selectedReferral.temp).text,
                              }}
                            >
                              {selectedReferral.temp || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="col-12">
                  <div className="card border border-neutral-200 shadow-sm bg-base">
                    <div className="card-body p-20">
                      <h6 className="fw-bold text-secondary-light mb-20 border-bottom pb-12 d-flex align-items-center gap-2 fs-5">
                        <Icon
                          icon="solar:chat-round-line-bold-duotone"
                          className="text-primary-600"
                        />
                        Comments
                      </h6>
                      <p className="mb-0 text-secondary-light line-height-1.6">
                        {selectedReferral.comments ||
                          "No comments available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top bg-base">
          <Button
            variant="outline-danger"
            onClick={() => setShowViewModal(false)}
            className="px-32 py-10 radius-8 fw-bold"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReferralNoteLayer;
