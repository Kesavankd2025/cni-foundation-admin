import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import { useNavigate } from "react-router-dom";
import ReportApi from "../Api/ReportApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import ShowNotifications from "../helper/ShowNotifications";
import usePermissions from "../hook/usePermissions";
import { Modal, Button } from "react-bootstrap";
import StandardDatePicker from "./StandardDatePicker";

const ChapterReportLayer = () => {
  const navigate = useNavigate();
  // Filter states
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEd, setSelectedEd] = useState(null);
  const [selectedRd, setSelectedRd] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [edOptions, setEdOptions] = useState([]);
  const [rdOptions, setRdOptions] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    value: "currentMonth",
    label: "Current Month",
  });
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelDates, setExcelDates] = useState({
    fromDate: "",
    toDate: "",
    format: { value: "csv", label: "Excel" },
  });
  const [excelErrors, setExcelErrors] = useState({
    fromDate: "",
    toDate: "",
  });
  const { hasPermission } = usePermissions();

  const dateOptions = [
    { value: "currentMonth", label: "Current Month" },
    { value: "tenure1", label: "Tenure 1 (Jan-Jun)" },
    { value: "tenure2", label: "Tenure 2 (Jul-Dec)" },
    { value: "oneYear", label: "One Year" },
    { value: "overall", label: "Overall" },
  ];

  useEffect(() => {
    fetchInitialOptions();
  }, []);

  useEffect(() => {
    fetchRoleBasedUsers(selectedZone?.value);
  }, [selectedZone]);

  useEffect(() => {
    fetchReport();
  }, [searchTerm, selectedZone, selectedEd, selectedRd, dateFilter]);

  const fetchInitialOptions = async () => {
    try {
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

  const fetchRoleBasedUsers = async (zoneId) => {
    try {
      const [edRes, rdRes] = await Promise.all([
        RegionApi.getRoleBasedUser("ed", zoneId),
        RegionApi.getRoleBasedUser("rd", zoneId),
      ]);

      if (edRes.status) {
        setEdOptions(
          edRes.response.data.map((e) => ({
            value: e._id,
            label: e.name || e.userName,
          })),
        );
      } else {
        setEdOptions([]);
      }

      if (rdRes.status) {
        setRdOptions(
          rdRes.response.data.map((r) => ({
            value: r._id,
            label: r.name || r.userName,
          })),
        );
      } else {
        setRdOptions([]);
      }
    } catch (error) {
      console.error("Error fetching role based users:", error);
    }
  };
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: 0,
        limit: 100,
        search: searchTerm,
        zoneId: selectedZone?.value || "",
        edId: selectedEd?.value || "",
        rdId: selectedRd?.value || "",
        filterType: dateFilter?.value || "currentMonth",
      };
      const res = await ReportApi.getChapterReport(params);
      if (res.status) {
        setReportData(res.response.data || []);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const statItems = [
    { key: "oneToOneCount", label: "One to One", icon: "mdi:account-multiple" },
    { key: "referralCount", label: "Referrals", icon: "mdi:handshake" },
    { key: "visitorCount", label: "Visitors", icon: "mdi:account-check" },
    { key: "chiefGuestCount", label: "Chief Guest's", icon: "mdi:star-circle" },
    { key: "powerDateCount", label: "Power meet's", icon: "mdi:calendar-star" },
    { key: "trainingCount", label: "Trainings", icon: "mdi:school" },
  ];

  const handleCardClick = (id) => {
    navigate(`/chapter-report-list/${id}`);
  };

  const handleClearFilters = () => {
    setSelectedZone(null);
    setSelectedEd(null);
    setSelectedRd(null);
    setSearchTerm("");
    setDateFilter({ value: "currentMonth", label: "Current Month" });
  };

  const handleExcelDateChange = (e) => {
    const { name, value } = e.target;
    setExcelDates((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setExcelErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleExcelSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!excelDates.fromDate) errors.fromDate = "From Date is required";
    if (!excelDates.toDate) errors.toDate = "To Date is required";

    if (Object.keys(errors).length > 0) {
      setExcelErrors(errors);
      return;
    }

    try {
      setIsLoading(true);

      const formatDateForPayload = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const formattedDates = {
        fromDate: formatDateForPayload(excelDates.fromDate),
        toDate: formatDateForPayload(excelDates.toDate),
        format: excelDates.format?.value || "csv",
        search: searchTerm,
        zoneId: selectedZone?.value || "",
        edId: selectedEd?.value || "",
        rdId: selectedRd?.value || "",
        filterType: dateFilter?.value || "currentMonth",
      };

      const res = await ReportApi.excelChapterReport(formattedDates);

      if (res.status && res.data) {
        const format = formattedDates.format;
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
        a.download = `Chapter_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
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
      setIsLoading(false);
    }
  };

  const handleCloseExcel = () => {
    setShowExcelModal(false);
    setExcelDates({
      fromDate: "",
      toDate: "",
      format: { value: "csv", label: "Excel" },
    });
    setExcelErrors({
      fromDate: "",
      toDate: "",
    });
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <h6 className="text-primary-600 pb-2 mb-0">Chapter Report</h6>
          <div className="d-flex align-items-center flex-wrap gap-3">
            <div style={{ minWidth: "200px" }}>
              <Select
                options={dateOptions}
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Select Duration"
                styles={selectStyles()}
                isClearable={false}
              />
            </div>
            <form className="navbar-search">
              <input
                type="text"
                className="bg-base h-40-px w-auto"
                name="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon icon="ion:search-outline" className="icon" />
            </form>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 align-items-end">
          <div className="col-xl col-md-6">
            <Select
              options={zoneOptions}
              value={selectedZone}
              onChange={setSelectedZone}
              placeholder="Zone"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-6">
            <Select
              options={edOptions}
              value={selectedEd}
              onChange={setSelectedEd}
              placeholder="ED"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl col-md-6">
            <Select
              options={rdOptions}
              value={selectedRd}
              onChange={setSelectedRd}
              placeholder="RD"
              styles={selectStyles()}
              isClearable
            />
          </div>
          <div className="col-xl-auto col-md-6 d-flex align-items-end">
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

      {/* Cards Section */}
      <div className="p-24">
        <div className="row g-4">
          {isLoading ? (
            <div className="col-12 py-5 text-center">Loading chapters...</div>
          ) : reportData.length > 0 ? (
            reportData.map((chapter) => (
              <div key={chapter._id} className="col-xl-4 col-lg-6 col-md-6">
                <div
                  className="h-100 shadow-sm transition-2 hover-shadow-md"
                  style={{
                    backgroundColor: "var(--white)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-color)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div className="p-20">
                    {/* Chapter Header */}
                    <div
                      className="rounded-3 p-16 mb-20"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-600), #1f1e46)",
                        color: "#fff",
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-between cursor-pointer"
                        onClick={() => handleCardClick(chapter._id)}
                      >
                        <div>
                          <div
                            className="mb-4 text-white fw-bold text-uppercase"
                            style={{ fontSize: "15px", letterSpacing: "0.5px" }}
                          >
                            {chapter.chapterName}
                          </div>
                          <div className="d-flex align-items-center gap-2 opacity-80">
                            <Icon icon="mdi:map-marker" width="14" />
                            <span className="text-xs">
                              {chapter.zoneState} | {chapter.zoneName}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div
                            className="fw-bold"
                            style={{ fontSize: "24px", lineHeight: 1 }}
                          >
                            {chapter.totalMembers}
                          </div>
                          <div className="text-xxs text-uppercase opacity-70 mt-4">
                            Members
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leadership Info */}
                    <div className="d-flex gap-3 mb-20 p-12 bg-neutral-50 radius-8 border hover-border-primary transition-2">
                      <div className="flex-grow-1">
                        <div className="text-xxs text-uppercase text-secondary-light fw-bold mb-4">
                          Executive Director
                        </div>
                        <div className="text-sm fw-bold text-dark">
                          {chapter.edName}
                        </div>
                      </div>
                      <div className="vr opacity-10"></div>
                      <div className="flex-grow-1">
                        <div className="text-xxs text-uppercase text-secondary-light fw-bold mb-4">
                          Regional Director
                        </div>
                        <div className="text-sm fw-bold text-dark">
                          {chapter.rdName}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="row g-2 mb-20">
                      {statItems.map((item) => (
                        <div key={item.key} className="col-6">
                          <div className="p-12 rounded-3 border bg-base transition-1 hover-border-primary transition-2 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                              <Icon
                                icon={item.icon}
                                width="16"
                                className="text-primary-600"
                              />
                              <span
                                className="fw-bold text-dark"
                                style={{ fontSize: "16px" }}
                              >
                                {chapter[item.key] || 0}
                              </span>
                            </div>
                            <div
                              className="text-secondary-light fw-medium"
                              style={{ fontSize: "14px" }}
                            >
                              {item.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Thank You Slip */}
                    <div
                      className="p-16 rounded-3 hover-border-primary transition-2"
                      style={{
                        background: "var(--success-50)",
                        border: "1px solid var(--success-100)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <small
                            className="fw-bold text-success-main text-uppercase"
                            style={{ fontSize: "14px" }}
                          >
                            Thank You Slips
                          </small>
                          <div
                            className="fw-bold text-dark mt-4"
                            style={{ fontSize: "18px" }}
                          >
                            ₹{chapter.thankYouSlipAmount}
                          </div>
                        </div>
                        <div className="bg-success-main text-white p-8 radius-8">
                          <Icon icon="mdi:cash-multiple" width="20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 py-60">
              <div className="text-center">
                <Icon
                  icon="solar:document-text-outline"
                  width="64"
                  className="text-neutral-300 mb-16"
                />
                <h5 className="text-secondary-light">
                  No Chapters Found Matching Your Filters
                </h5>
                <button
                  className="btn btn-primary-600 mt-16"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <div className="p-24 d-flex justify-content-start">
        {hasPermission("Chapter Report", "view") && (
          <button
            type="button"
            className="btn btn-primary radius-8 px-20 py-11 d-flex align-items-center gap-2"
            onClick={() => setShowExcelModal(true)}

          >
            <Icon icon="lucide:download" className="text-xl" />
            Report
          </button>
        )}
      </div> */}

      {/* Excel Download Modal */}
      <Modal
        centered
        show={showExcelModal}
        onHide={handleCloseExcel}
        contentClassName="radius-16 border-0"
      >
        <Modal.Header className="py-12 px-16 border-bottom border-neutral-200" style={{ backgroundColor: "#FFF5F5" }}>
          <h6 className="fontsize-14 fw-bold mb-0" style={{ color: "#003366" }}>
            Select Date Range
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

export default ChapterReportLayer;
