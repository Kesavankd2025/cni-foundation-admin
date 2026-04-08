import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import ReportApi from "../Api/ReportApi";
import ShowNotifications from "../helper/ShowNotifications";
import { selectStyles } from "../helper/SelectStyles";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";
// import StandardDatePicker from "./StandardDatePicker";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import { formatIndianCurrency } from "../helper/TextHelper";

const ChapterReportListLayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const chapterName =
    id === "1"
      ? "ARAM"
      : id === "2"
        ? "Chapter testing"
        : id === "3"
          ? "Arni"
          : "Chapter";
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
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
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, rowsPerPage, debouncedSearchTerm, id]);

  const fetchMembers = async () => {
    try {
      const res = await ReportApi.getChapterMemberReport({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearchTerm,
        chapterId: id,
      });

      if (res.status) {
        setMembers(res.response.data);
        setTotalRecords(res.response.total);
      }
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const currentData = members;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleViewPopup = (member) => {
    setSelectedMember(member);
    const modal = new window.bootstrap.Modal(
      document.getElementById("memberDetailsModal"),
    );
    modal.show();
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
        chapterId: id,
      };
      */

      const payload = {
        format: excelDates.format?.value || "csv",
        search: debouncedSearchTerm,
        chapterId: id,
      };

      const res = await ReportApi.excelChapterMemberReport(payload);

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
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 mb-0 ms-2">
            Chapter Report Details
          </h6>
        </div>
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
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 radius-8"
          >
            <Icon icon="ion:arrow-back-outline" />
            Back
          </button>
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
                  Member Name
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Category
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black", fontWeight: "600" }}
                >
                  121
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black", fontWeight: "600" }}
                >
                  Referral
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black", fontWeight: "600" }}
                >
                  Visitor
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black", fontWeight: "600" }}
                >
                  Chief Guest
                </th>
                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                  Thank You Slip Value
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black", fontWeight: "600" }}
                >
                  Power Meet
                </th>
                <th
                  scope="col"
                  className="text-center"
                  style={{ color: "black", fontWeight: "600" }}
                >
                  Training
                </th>
                {/* <th scope="col" className="text-center" style={{ color: "black", fontWeight: '600' }}>View pop up</th> */}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="text-center py-4">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Loading data...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                currentData.map((member, index) => (
                  <tr key={member.id}>
                    <td>
                      <span className="text-md mb-0 fw-medium text-secondary-light">
                        {currentPage * rowsPerPage + index + 1}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-medium text-primary-600">
                        {member.memberName}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.category}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.oneToOneCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.referralCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.visitorCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.chiefGuestCount}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="text-md mb-0 fw-normal text-success-600 fw-bold">
                        {formatIndianCurrency(member.thankYouSlipValue)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.powerDateCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {member.trainingCount}
                      </span>
                    </td>
                    {/* <td className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleViewPopup(member)}
                                                className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0 mx-auto"
                                            >
                                                <Icon
                                                    icon="majesticons:eye-line"
                                                    className="icon text-xl"
                                                />
                                            </button>
                                        </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-4">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="mt-24">
            {hasPermission("Member's List", "view") && currentData && currentData.length > 0 && (
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

                  disabled={isLoading}
                >
                  {isLoading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal for Overall Details */}
      <div
        className="modal fade"
        id="memberDetailsModal"
        tabIndex="-1"
        aria-labelledby="memberDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content radius-16 border-0">
            <div className="modal-header border-bottom bg-base py-16 px-24">
              <h6
                className="modal-title fw-bold text-primary-600"
                id="memberDetailsModalLabel"
              >
                Overall Details - {selectedMember?.memberName}
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-24">
              {selectedMember && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-16 radius-12 bg-neutral-50 border">
                      <h6 className="text-sm fw-bold mb-12 text-secondary-light">
                        Member Information
                      </h6>
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary-light">Name:</span>
                          <span className="fw-medium text-dark">
                            {selectedMember.memberName}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary-light">
                            Category:
                          </span>
                          <span className="fw-medium text-dark">
                            {selectedMember.category}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary-light">Chapter:</span>
                          <span className="fw-medium text-dark">
                            {chapterName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-16 radius-12 bg-neutral-50 border h-100">
                      <h6 className="text-sm fw-bold mb-12 text-secondary-light">
                        Performance Summary
                      </h6>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="text-xxs text-secondary-light text-uppercase">
                            1-2-1s
                          </div>
                          <div className="fw-bold text-lg">
                            {selectedMember.oneToOnes}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-xxs text-secondary-light text-uppercase">
                            Referrals
                          </div>
                          <div className="fw-bold text-lg">
                            {selectedMember.referrals}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-xxs text-secondary-light text-uppercase">
                            Visitors
                          </div>
                          <div className="fw-bold text-lg">
                            {selectedMember.visitors}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-xxs text-secondary-light text-uppercase">
                            Trainings
                          </div>
                          <div className="fw-bold text-lg">
                            {selectedMember.trainings}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-16 radius-12 bg-success-focus border border-success-200">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-sm fw-bold mb-4 text-success-main">
                            Total Business Shared
                          </h6>
                          <div className="display-6 fw-bold text-success-main">
                            {formatIndianCurrency(selectedMember.thankYouSlip || selectedMember.thankYouSlipValue)}
                          </div>
                        </div>
                        <Icon
                          icon="solar:round-transfer-horizontal-bold-duotone"
                          width="48"
                          className="text-success-main opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-16 radius-12 bg-primary-50 border border-primary-100">
                      <h6 className="text-sm fw-bold mb-12 text-primary-600">
                        Other Activities
                      </h6>
                      <div className="d-flex flex-wrap gap-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="w-8-px h-8-px rounded-circle bg-primary-600"></div>
                          <span className="text-sm">
                            Chief Guest Apps:{" "}
                            <strong>{selectedMember.chiefGuests}</strong>
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="w-8-px h-8-px rounded-circle bg-primary-600"></div>
                          <span className="text-sm">
                            Power Meets:{" "}
                            <strong>{selectedMember.powerDates}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-top-0 p-24 pt-0">
              <button
                type="button"
                className="btn btn-secondary radius-8"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterReportListLayer;
