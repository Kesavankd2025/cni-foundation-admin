import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import MemberApi from "../Api/MemberApi";
import RegionApi from "../Api/RegionApi";
import ZoneApi from "../Api/ZoneApi";
import ChapterApi from "../Api/ChapterApi";
import ReportApi from "../Api/ReportApi";
import ShowNotifications from "../helper/ShowNotifications";
import usePermissions from "../hook/usePermissions";
import { Modal, Button } from "react-bootstrap";
// import StandardDatePicker from "./StandardDatePicker";

const ChapterMemberListLayer = () => {
  const navigate = useNavigate();

  // Filter states
  // Filter states
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEd, setSelectedEd] = useState(null);
  const [selectedRd, setSelectedRd] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Options states
  const [zoneOptions, setZoneOptions] = useState([]);
  const [edOptions, setEdOptions] = useState([]);
  const [rdOptions, setRdOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);

  // Member data state
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = usePermissions();
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

  useEffect(() => {
    fetchInitialFilters();
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
    fetchMembers();
  }, [
    currentPage,
    rowsPerPage,
    searchTerm,
    selectedZone,
    selectedEd,
    selectedRd,
    selectedChapter,
  ]);

  const fetchInitialFilters = async () => {
    try {
      const zonesRes = await ZoneApi.getZone();
      if (zonesRes.status) {
        setZoneOptions(
          zonesRes.response.data.map((z) => ({
            value: z._id,
            label: z.name,
          })),
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
          edRes.response.data.map((e) => ({
            value: e._id,
            label: e.fullName || e.name,
          })),
        );
      } else {
        setEdOptions([]);
      }

      if (rdRes.status) {
        setRdOptions(
          rdRes.response.data.map((r) => ({
            value: r._id,
            label: r.fullName || r.name,
          })),
        );
      } else {
        setRdOptions([]);
      }
    } catch (error) {
      console.error("Error fetching role based users:", error);
    }
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        zoneId: selectedZone?.value,
        chapterId: selectedChapter?.value,
        edId: selectedEd?.value,
        rdId: selectedRd?.value,
      };
      const res = await MemberApi.getMembers(params);
      if (res.status) {
        setReportData(res.response.data || []);
        setTotalRecords(res.response.total || 0);
        setTotalPages(res.response.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedZone(null);
    setSelectedEd(null);
    setSelectedRd(null);
    setSelectedChapter(null);
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
        search: searchTerm,
        chapterId: selectedChapter?.value,
        zoneId: selectedZone?.value,
        edId: selectedEd?.value,
        rdId: selectedRd?.value,
      };
      */
      const payload = {
        format: excelDates.format?.value || "csv",
        search: searchTerm,
        chapterId: selectedChapter?.value,
        zoneId: selectedZone?.value,
        edId: selectedEd?.value,
        rdId: selectedRd?.value,
      };

      const res = await ReportApi.excelMemberReport(payload);

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
        // a.download = `ChapterMember_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
        a.download = `ChapterMember_Report.${extensions[format] || "csv"}`;
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

  const handleViewProfile = (member) => {
    console.log("memberDetails :", member);
    // Navigating to profile view page
    navigate("/view-profile", { state: { member } });
  };

  return (
    <div className="card h-100 p-0 radius-12 overflow-hidden">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <h6 className="text-primary-600 pb-2 mb-0">Chapter Member List</h6>
          <div className="d-flex align-items-center flex-wrap gap-3">
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

        {/* Top Filters */}

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
          <div className="col-xl-2 col-md-4 col-sm-6">
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
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  S.No
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Member ID
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Member Name
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Phone Number
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Chapter
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Category
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Company Name
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading members...
                  </td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((member, index) => (
                  <tr key={member._id || member.id}>
                    <td>
                      <span className="text-md mb-0 fw-medium text-secondary-light">
                        {currentPage * rowsPerPage + index + 1}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 text-primary-600">
                        {member.membershipId}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-medium text-dark">
                        {member.fullName}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.phoneNumber}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.chapterName || member.chapter || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.businessCategoryName ||
                          member.businessCategory ||
                          "-"}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.companyName}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleViewProfile(member)}
                        className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                        title="View Profile"
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
                  <td colSpan="8" className="text-center py-4">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="mt-24">
            {hasPermission("Member's List", "view") && reportData && reportData.length > 0 && (
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
    </div>
  );
};

export default ChapterMemberListLayer;
