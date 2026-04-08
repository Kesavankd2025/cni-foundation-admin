import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import ReportApi from "../Api/ReportApi";
import ChapterApi from "../Api/ChapterApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import ShowNotifications from "../helper/ShowNotifications";
import usePermissions from "../hook/usePermissions";
import { toPascalCase } from "../helper/TextHelper";
import StandardDatePicker from "./StandardDatePicker";
import { formatDateUTC } from "../helper/DateHelper";

const RenewalReportLayer = () => {
  // Data states
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Filter States
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEd, setSelectedEd] = useState(null);
  const [selectedRd, setSelectedRd] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Options states
  const [chapterOptions, setChapterOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [edOptions, setEdOptions] = useState([]);
  const [rdOptions, setRdOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);

  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [renewFormData, setRenewFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    years: "",
    transferMode: null,
    transactionId: "",
  });
  const [isRenewing, setIsRenewing] = useState(false);
  const [formErrors, setFormErrors] = useState({
    amount: "",
    years: "",
    transferMode: "",
    transactionId: "",
  });
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const { hasPermission } = usePermissions();

  const transferModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "UPI", label: "UPI" },
    { value: "Bank Transfer", label: "Bank Transfer" },
  ];

  useEffect(() => {
    fetchInitialOptions();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchChapters(selectedZone.value);
    } else {
      fetchChapters();
    }
    setSelectedChapter(null); // Clear chapter when zone changes
    setSelectedEd(null); // Clear ED when zone changes
    setSelectedRd(null); // Clear RD when zone changes
  }, [selectedZone]);

  useEffect(() => {
    fetchEdRd();
  }, [selectedZone, selectedChapter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchReport();
  }, [
    currentPage,
    rowsPerPage,
    debouncedSearchTerm,
    selectedZone,
    selectedChapter,
    selectedEd,
    selectedRd,
    selectedRegion,
  ]);

  const fetchInitialOptions = async () => {
    try {
      const [zonesRes, regionsRes] = await Promise.all([
        ZoneApi.getZone(),
        RegionApi.getRegion(),
      ]);

      if (zonesRes.status) {
        setZoneOptions(
          zonesRes.response.data.map((z) => ({
            value: z._id,
            label: z.name,
          })),
        );
      }
      if (regionsRes.status) {
        setRegionOptions(
          regionsRes.response.data.map((r) => ({
            value: r._id,
            label: r.region,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchEdRd = async () => {
    try {
      const zoneId = selectedZone?.value || "";
      const chapterId = selectedChapter?.value || "";
      const [edRes, rdRes] = await Promise.all([
        RegionApi.getRoleBasedUser("ed", zoneId, chapterId),
        RegionApi.getRoleBasedUser("rd", zoneId, chapterId),
      ]);

      if (edRes.status) {
        setEdOptions(
          edRes.response.data.map((e) => ({
            value: e._id,
            label: e.name || e.userName,
          })),
        );
      }
      if (rdRes.status) {
        setRdOptions(
          rdRes.response.data.map((r) => ({
            value: r._id,
            label: r.name || r.userName,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching ED/RD options:", error);
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

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearchTerm,
        chapterId: selectedChapter?.value,
        zoneId: selectedZone?.value,
        edId: selectedEd?.value,
        rdId: selectedRd?.value,
        regionId: selectedRegion?.value,
      };

      const res = await ReportApi.getRenewalReport(params);
      if (res.status) {
        setReportData(res.response.data || []);
        setTotalRecords(res.response.total || 0);
      } else {
        setReportData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching renewal report:", error);
      setReportData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setCurrentPage(0);
    fetchReport();
  };

  const handleClearFilters = () => {
    setSelectedChapter(null);
    setSelectedZone(null);
    setSelectedEd(null);
    setSelectedRd(null);
    setSelectedRegion(null);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(0);
    // After clearing, we might want to refetch with all empty filters or just leave it.
    // fetchReport will be triggered by the useEffect due to searchTerm and page changes.
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleRenewClick = (member) => {
    setSelectedMember(member);
    setRenewFormData({
      paymentDate: new Date().toISOString().split("T")[0],
      amount: "",
      years: "",
      transferMode: null,
      transactionId: "",
    });
    setFormErrors({
      amount: "",
      years: "",
      transferMode: "",
      transactionId: "",
    });
    setShowRenewModal(true);
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
    if (!excelDates.fromDate) errors.fromDate = "From Date is Required";
    if (!excelDates.toDate) errors.toDate = "To Date is Required";

    if (Object.keys(errors).length > 0) {
      setExcelErrors(errors);
      return;
    }
    */

    try {
      setIsLoading(true);

      /*
      const formatDateForPayload = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const formattedDates = {
        fromDate: formatDateForPayload(excelDates.fromDate),
        toDate: formatDateForPayload(excelDates.toDate),
        format: excelDates.format?.value || "csv",
        search: debouncedSearchTerm,
        chapterId: selectedChapter?.value,
        zoneId: selectedZone?.value,
        edId: selectedEd?.value,
        rdId: selectedRd?.value,
        regionId: selectedRegion?.value,
      };
      */

      const payload = {
        format: excelDates.format?.value || "csv",
        search: debouncedSearchTerm,
        chapterId: selectedChapter?.value,
        zoneId: selectedZone?.value,
        edId: selectedEd?.value,
        rdId: selectedRd?.value,
        regionId: selectedRegion?.value,
      };

      const res = await ReportApi.excelRenewalReport(payload);

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
        // a.download = `Renewal_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
        a.download = `Renewal_Report.${extensions[format] || "csv"}`;
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

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    const errors = {};
    if (!renewFormData.amount) errors.amount = "Amount is Required";
    if (!renewFormData.years) errors.years = "Duration is Required";
    if (!renewFormData.transferMode) errors.transferMode = "Payment mode is Required";
    if (
      (renewFormData.transferMode?.value === "UPI" ||
        renewFormData.transferMode?.value === "Bank Transfer" ||
        renewFormData.transferMode?.value === "Card") &&
      !renewFormData.transactionId
    ) {
      errors.transactionId = "Transaction ID is Required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsRenewing(true);
    try {
      const payload = {
        paymentDate: renewFormData.paymentDate,
        amount: renewFormData.amount,
        years: renewFormData.years,
        paymentMode: renewFormData.transferMode?.value,
        transactionId: renewFormData.transactionId,
      };

      const res = await ReportApi.renewMembership(
        selectedMember._id || selectedMember.id,
        payload,
      );
      if (res.status) {
        setShowRenewModal(false);
        fetchReport(); // Refresh the list
      }
    } catch (error) {
      console.error("Error renewing membership:", error);
    } finally {
      setIsRenewing(false);
    }
  };

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      const res = await ReportApi.toggleRenewalStatus(
        memberToDelete._id || memberToDelete.id,
      );
      if (res.status) {
        fetchReport(); // Refresh list
        setShowDeleteModal(false);
        setMemberToDelete(null);
      }
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <h6 className="text-primary-600 pb-2 mb-0">Renewal Report</h6>
          <div className="d-flex align-items-center gap-3">
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
              to="/renewal-history"
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 radius-8"
              style={{ height: '40px', padding: '0 16px' }}
            >
              <Icon icon="solar:history-bold" className="text-xl" />
              History
            </Link>
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
          {/* <div className="col-xl col-md-4 col-sm-6">
            <Select
              options={regionOptions}
              value={selectedRegion}
              onChange={setSelectedRegion}
              placeholder="Region"
              styles={selectStyles()}
              isClearable
            />
          </div> */}
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
          <div className="col-xl-auto col-md-4 col-sm-6 d-flex align-items-end gap-2">
            {/* <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary d-flex align-items-center gap-2 radius-8 h-40-px text-nowrap"
              
            >
              Submission
            </button> */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-outline-danger d-flex align-items-center gap-2 radius-8 h-40-px text-nowrap"
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
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>S.No</th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Member ID</th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Member Name</th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Chapter</th>
                {/* <th scope="col" style={{ color: "black", fontWeight: "600" }}>Region</th> */}
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Expiry Date</th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Day's</th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Status</th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading reports...</td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{item.memberId || "-"}</td>
                    <td>{item.memberName || item.fullName || "-"}</td>
                    <td>{item.chapter || item.chapterName || "-"}</td>
                    <td>{formatDateUTC(item.renewalDate)}</td>
                    <td>
                      <span
                        className={`badge ${item.status === "Expired"
                          ? "bg-danger-focus text-danger-main"
                          : "bg-warning-focus text-warning-main"
                          } px-24 py-4 rounded-pill fw-medium text-sm`}
                      >{item.days || "-"}</span></td>
                    <td>
                      <span
                        className={`badge ${item.status === "Expired"
                          ? "bg-danger-focus text-danger-main"
                          : "bg-warning-focus text-warning-main"
                          } px-24 py-4 rounded-pill fw-medium text-sm`}
                      >
                        {toPascalCase(item.status || "N/A")}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        {hasPermission("Renewal Report", "add") && (
                          <button
                            onClick={() => handleRenewClick(item)}
                            className="btn btn-primary btn-sm text-sm px-12 py-6 radius-8"
                            style={{
                              backgroundColor: "#003366",
                              borderColor: "#003366",
                            }}
                          >
                            Renew
                          </button>
                        )}
                        <Link
                          to={`/member/${item._id}/renewal-history`}
                          className="bg-warning-focus bg-hover-warning-200 text-warning-600 fw-medium w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle"
                          title="Renewal History"
                        >
                          <Icon
                            icon="solar:history-bold-duotone"
                            className="icon text-lg"
                          />
                        </Link>
                        {hasPermission("Renewal Report", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(item)}
                            className={`remove-item-btn ${item.isRenewal === false ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                            title={item.isRenewal === false ? "Deactivate Member" : "Activate Member"}
                          >
                            <Icon icon={item.isRenewal === false ? "lucide:unlock" : "lucide:lock"} className="icon text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">No records found.</td>
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

        <div className="mt-24">
          {hasPermission("Renewal Report", "view") && reportData && reportData.length > 0 && (
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
      </div>

      <Modal
        show={showRenewModal}
        onHide={() => !isRenewing && setShowRenewModal(false)}
        centered
        size="md"
        className="premium-modal"
      >
        <Modal.Header className="bg-white border-bottom-0 py-20 px-24 d-flex align-items-center justify-content-between" style={{ borderLeft: "5px solid #003366" }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger-focus p-10 radius-10 d-flex align-items-center justify-content-center">
              <Icon icon="solar:user-id-bold-duotone" className="text-danger-600 text-2xl" />
            </div>
            <Modal.Title className="text-xl fw-bold text-primary-600 mb-0">
              Renew Membership
            </Modal.Title>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowRenewModal(false)}
            disabled={isRenewing}
          />
        </Modal.Header>

        <Modal.Body className="p-24 pt-0">
          {selectedMember && (
            <div className="membership-renewal-container">
              {/* Member Details Header Card */}
              <div className="bg-neutral-50 radius-12 p-16 mb-24 border border-neutral-100">
                <div className="d-flex align-items-center gap-12 mb-12">
                  <div className="w-48-px h-48-px bg-white rounded-circle d-flex align-items-center justify-content-center border border-neutral-200">
                    <Icon icon="solar:user-bold" className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-secondary-light fs-5">
                      {selectedMember.memberName || selectedMember.fullName}
                    </h6>
                    <span className="text-xs text-secondary-light fw-medium">
                      Member ID: <span className="text-primary-600">{selectedMember.memberId}</span>
                    </span>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 pt-12 border-top border-neutral-200">
                  <span className="badge bg-white text-secondary-light border border-neutral-200 px-12 py-6 radius-6 text-xs d-flex align-items-center gap-1">
                    <Icon icon="solar:map-point-bold-duotone" className="text-danger-600" />
                    {selectedMember.chapter || selectedMember.chapterName}
                  </span>
                  <span className="badge bg-white text-secondary-light border border-neutral-200 px-12 py-6 radius-6 text-xs d-flex align-items-center gap-1">
                    <Icon icon="solar:tag-bold-duotone" className="text-warning-600" />
                    {selectedMember.membershipId}
                  </span>
                </div>
              </div>

              <form onSubmit={handleRenewSubmit}>
                <div className="mb-20">
                  <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                    Payment Date <span className="text-danger">*</span>
                  </label>
                  <StandardDatePicker
                    name="paymentDate"
                    value={renewFormData.paymentDate}
                    onChange={(e) => setRenewFormData({ ...renewFormData, paymentDate: e.target.value })}
                    className="form-control radius-8"
                    disabled={isRenewing}
                  />
                </div>

                <div className="row g-3 mb-20">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                      Renewal Amount <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <Icon icon="solar:wad-of-money-bold-duotone" className="text-primary-600" />
                      </span>
                      <input
                        type="number"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter amount"
                        value={renewFormData.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || parseFloat(val) >= 0) {
                            setRenewFormData({
                              ...renewFormData,
                              amount: val,
                            });
                            if (val) setFormErrors(prev => ({ ...prev, amount: "" }));
                          }
                        }}
                        min="0"
                        disabled={isRenewing}
                      />
                    </div>
                    {formErrors.amount && <span className="text-danger text-xs mt-1 d-block">{formErrors.amount}</span>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                      Duration (Years) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <Icon icon="solar:calendar-bold-duotone" className="text-primary-600" />
                      </span>
                      <input
                        type="number"
                        className="form-control border-start-0 ps-0"
                        placeholder="e.g. 1"
                        value={renewFormData.years}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRenewFormData({
                            ...renewFormData,
                            years: val,
                          });
                          if (val) setFormErrors(prev => ({ ...prev, years: "" }));
                        }}
                        min="1"
                        disabled={isRenewing}
                      />
                    </div>
                    {formErrors.years && <span className="text-danger text-xs mt-1 d-block">{formErrors.years}</span>}
                  </div>
                </div>

                <div className="mb-20">
                  <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                    Payment Mode <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={transferModeOptions}
                    value={renewFormData.transferMode}
                    onChange={(opt) => {
                      setRenewFormData({
                        ...renewFormData,
                        transferMode: opt,
                        transactionId:
                          opt?.value === "Cash" ? "" : renewFormData.transactionId,
                      });
                      if (opt) setFormErrors(prev => ({ ...prev, transferMode: "" }));
                    }}
                    placeholder="Select payment method"
                    styles={selectStyles()}
                    isDisabled={isRenewing}
                  />
                  {formErrors.transferMode && <span className="text-danger text-xs mt-1 d-block">{formErrors.transferMode}</span>}
                </div>

                {(renewFormData.transferMode?.value === "UPI" ||
                  renewFormData.transferMode?.value === "Bank Transfer" ||
                  renewFormData.transferMode?.value === "Card") && (
                    <div className="mb-24 animate__animated animate__fadeInDown animate__faster">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Transaction Reference ID <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <Icon icon="solar:ranking-bold-duotone" className="text-primary-600" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Enter reference / transaction ID"
                          value={renewFormData.transactionId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRenewFormData({
                              ...renewFormData,
                              transactionId: val,
                            });
                            if (val) setFormErrors(prev => ({ ...prev, transactionId: "" }));
                          }}
                          disabled={isRenewing}
                        />
                      </div>
                      {formErrors.transactionId && <span className="text-danger text-xs mt-1 d-block">{formErrors.transactionId}</span>}
                    </div>
                  )}

                <div className="d-flex align-items-center justify-content-end gap-3 pt-8">
                  <button
                    type="button"
                    className="btn btn-outline-neutral-600 px-24 py-11 radius-8 fw-semibold"
                    onClick={() => setShowRenewModal(false)}
                    disabled={isRenewing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-32 py-11 radius-8 fw-bold d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#003366", borderColor: "#003366", boxShadow: "0 4px 12px rgba(0, 51, 102, 0.2)" }}
                    disabled={isRenewing}
                  >
                    {isRenewing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Renewing...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:check-circle-bold" className="text-xl" />
                        Confirm Renewal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal.Body>
      </Modal>

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
              {(selectedZone || selectedChapter || selectedRd || selectedEd || selectedRegion) && (
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
                      {selectedRegion && (
                        <div className="d-flex align-items-center gap-8">
                          <span className="text-secondary-light fontsize-8 fw-medium w-64-px">Region:</span>
                          <span className="text-primary-light fontsize-8 fw-semibold">{selectedRegion.label}</span>
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

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${memberToDelete?.isRenewal === false ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={memberToDelete?.isRenewal === false ? "lucide:unlock" : "lucide:lock"}
                className={`${memberToDelete?.isRenewal === false ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            {memberToDelete?.isRenewal === false
              ? `Do you want to move "${memberToDelete?.memberName || memberToDelete?.fullName}" to the bottom of the list?`
              : `Do you want to move "${memberToDelete?.memberName || memberToDelete?.fullName}" to the top of the list?`}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseDelete}
            >
              Cancel
            </Button>
            <Button
              variant={memberToDelete?.isRenewal === false ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={memberToDelete?.isRenewal === false ? { backgroundColor: "#dc3545", borderColor: "#dc3545" } : { backgroundColor: "#198754", borderColor: "#198754" }}
            >
              {memberToDelete?.isRenewal === false ? "Confrim" : "Confrim"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RenewalReportLayer;
