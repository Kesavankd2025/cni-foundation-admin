import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import TablePagination from "./TablePagination";
import ReportApi from "../Api/ReportApi";
import { formatDateUTC } from "../helper/DateHelper";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import StandardDatePicker from "./StandardDatePicker";
import ShowNotifications from "../helper/ShowNotifications";
import { formatIndianCurrency } from "../helper/TextHelper";
import usePermissions from "../hook/usePermissions";

const RenewalHistoryLayer = () => {
    const { id: memberId } = useParams();
    const { hasPermission } = usePermissions();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [isBackHovered, setIsBackHovered] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Filter states
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [excelDates, setExcelDates] = useState({
        format: { value: "csv", label: "Excel" },
        fromDate: "",
        toDate: "",
    });
    const [excelErrors, setExcelErrors] = useState({});

    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        paymentDate: "",
        amount: "",
        years: "",
        paymentMode: null,
        transactionId: "",
    });
    const [editFormErrors, setEditFormErrors] = useState({});

    const transferModeOptions = [
        { value: "Cash", label: "Cash" },
        { value: "Card", label: "Card" },
        { value: "UPI", label: "UPI" },
        { value: "Bank Transfer", label: "Bank Transfer" },
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const formatDateForApi = (isoString) => {
                if (!isoString) return "";
                const date = new Date(isoString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: debouncedSearchTerm,
                memberId: memberId || "",
                fromDate: formatDateForApi(fromDate),
                toDate: formatDateForApi(toDate)
            };

            const res = await ReportApi.getRenewalHistory(params);
            if (res.status) {
                setHistoryData(res.response.data || []);
                setTotalRecords(res.response.total || 0);
            } else {
                setHistoryData([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error("Error fetching renewal history:", error);
            setHistoryData([]);
            setTotalRecords(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [currentPage, rowsPerPage, debouncedSearchTerm, memberId, fromDate, toDate]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(0);
    };

    // Edit modal handlers
    const handleEditClick = (item) => {
        setSelectedHistory(item);
        setEditFormData({
            paymentDate: item.paymentDate
                ? new Date(item.paymentDate).toISOString().split("T")[0]
                : item.date
                    ? new Date(item.date).toISOString().split("T")[0]
                    : "",
            amount: item.amount || "",
            years: item.years || "",
            paymentMode: item.paymentMode
                ? transferModeOptions.find((o) => o.value === item.paymentMode) || { value: item.paymentMode, label: item.paymentMode }
                : null,
            transactionId: item.transactionId || "",
        });
        setEditFormErrors({});
        setShowEditModal(true);
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setSelectedHistory(null);
        setEditFormErrors({});
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!editFormData.amount) errors.amount = "Amount is Required";
        if (!editFormData.years) errors.years = "Duration is Required";
        if (!editFormData.paymentMode) errors.paymentMode = "Payment mode is Required";
        if (
            (editFormData.paymentMode?.value === "UPI" ||
                editFormData.paymentMode?.value === "Bank Transfer" ||
                editFormData.paymentMode?.value === "Card") &&
            !editFormData.transactionId
        ) {
            errors.transactionId = "Transaction ID is Required";
        }

        if (Object.keys(errors).length > 0) {
            setEditFormErrors(errors);
            return;
        }

        setIsUpdating(true);
        try {
            const payload = {
                paymentDate: editFormData.paymentDate,
                amount: editFormData.amount,
                years: editFormData.years,
                paymentMode: editFormData.paymentMode?.value,
                transactionId: editFormData.transactionId,
            };

            const historyId = selectedHistory._id || selectedHistory.id;
            const res = await ReportApi.updateRenewalHistory(historyId, payload);
            if (res.status) {
                setShowEditModal(false);
                fetchHistory();
            }
        } catch (error) {
            console.error("Error updating renewal history:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExcelSubmit = async (e) => {
        e.preventDefault();
        try {
            const formatDateForApi = (isoString) => {
                if (!isoString) return "";
                const date = new Date(isoString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            setIsLoading(true);
            const payload = {
                format: excelDates.format?.value || "csv",
                fromDate: formatDateForApi(excelDates.fromDate),
                toDate: formatDateForApi(excelDates.toDate),
                search: debouncedSearchTerm,
                memberId: memberId || ""
            };

            const res = await ReportApi.excelRenewalHistory(payload);

            if (res.status && res.data) {
                const format = payload.format;
                const mimeTypes = {
                    csv: "text/csv;charset=utf-8;",
                    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    pdf: "application/pdf",
                };
                const extensions = { csv: "csv", excel: "xlsx", pdf: "pdf" };

                const blob = new Blob([res.data], { type: mimeTypes[format] || mimeTypes.csv });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Renewal_History_${memberId || 'Report'}.${extensions[format] || "csv"}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                ShowNotifications.showAlertNotification("Report downloaded successfully.", true);
                setShowExcelModal(false);
            } else {
                ShowNotifications.showAlertNotification("Failed to download report.", false);
            }
        } catch (err) {
            console.error(err);
            ShowNotifications.showAlertNotification("Something went wrong while downloading the report.", false);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                    <h6 className="text-primary-600 mb-0">Renewal History</h6>
                </div>
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

                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: "200px" }}>
                            <StandardDatePicker
                                placeholder="From Date"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setCurrentPage(0);
                                }}
                            />
                        </div>
                        <div style={{ width: "200px" }}>
                            <StandardDatePicker
                                placeholder="To Date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setCurrentPage(0);
                                }}
                                minDate={fromDate}
                            />
                        </div>
                    </div>

                    <Link
                        to="/renewal-report"
                        onMouseEnter={() => setIsBackHovered(true)}
                        onMouseLeave={() => setIsBackHovered(false)}
                        className="btn d-inline-flex align-items-center gap-2 px-16 py-8 radius-8 fontsize-10 fw-bold transition-all shadow-sm"
                        style={{
                            backgroundColor: isBackHovered ? "#64748B" : "#F3F4F6",
                            color: isBackHovered ? "#FFFFFF" : "#64748B",
                            border: `1px solid ${isBackHovered ? "#64748B" : "#CBD5E1"}`
                        }}
                    >
                        <Icon icon="solar:alt-arrow-left-linear" className="fontsize-14" />
                        Back
                    </Link>
                </div>
            </div>

            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>S.No</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Payment Date</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Member ID</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Member Name</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Chapter</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Amount</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Year's</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Payment Mode</th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>Transaction ID</th>
                                {hasPermission("Renewal Report", "edit") && (
                                    <th scope="col" style={{ color: "black", fontWeight: "600" }}>Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">Loading history...</td>
                                </tr>
                            ) : historyData.length > 0 ? (
                                historyData.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>{formatDateUTC(item.paymentDate || item.date)}</td>
                                        <td>{item.memberId || "-"}</td>
                                        <td>{item.memberName || item.fullName || "-"}</td>
                                        <td>{item.chapterName || "-"}</td>
                                        <td>{formatIndianCurrency(item.amount)}</td>
                                        <td>{item.years || "0"}</td>
                                        <td>{item.paymentMode || "-"}</td>
                                        <td>{item.transactionId || "-"}</td>
                                        {hasPermission("Renewal Report", "edit") && (
                                            <td>
                                                <div className="d-flex align-items-center gap-10">
                                                    <button
                                                        type="button"
                                                        onClick={() => item.isEditable !== false && handleEditClick(item)}
                                                        disabled={item.isEditable === false}
                                                        className={`btn-edit-custom fw-medium w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle border-0 
        ${item.isEditable === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title={item.isEditable === false ? "Not Editable" : "Edit Renewal"}
                                                    >
                                                        <Icon
                                                            icon={item.isEditable === false ? "lucide:x-circle" : "lucide:edit"}
                                                            className="menu-icon"
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">
                                        No history records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-24">
                    <div></div>
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
                </div>
            </div>

            {/* Edit Renewal History Modal */}
            <Modal
                show={showEditModal}
                onHide={() => !isUpdating && handleEditClose()}
                centered
                size="md"
                className="premium-modal"
            >
                <Modal.Header
                    className="bg-white border-bottom-0 py-20 px-24 d-flex align-items-center justify-content-between"
                    style={{ borderLeft: "5px solid #003366" }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-focus p-10 radius-10 d-flex align-items-center justify-content-center">
                            <Icon icon="lucide:edit" className="text-primary-600 text-2xl" />
                        </div>
                        <Modal.Title className="text-xl fw-bold text-primary-600 mb-0">
                            Edit Renewal History
                        </Modal.Title>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={handleEditClose}
                        disabled={isUpdating}
                    />
                </Modal.Header>

                <Modal.Body className="p-24 pt-0">
                    {selectedHistory && (
                        <div className="membership-renewal-container">
                            {/* Member Info Card */}
                            <div className="bg-neutral-50 radius-12 p-16 mb-24 border border-neutral-100">
                                <div className="d-flex align-items-center gap-12 mb-12">
                                    <div className="w-48-px h-48-px bg-white rounded-circle d-flex align-items-center justify-content-center border border-neutral-200">
                                        <Icon icon="solar:user-bold" className="text-primary-600 text-xl" />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold text-secondary-light fs-5">
                                            {selectedHistory.memberName || selectedHistory.fullName}
                                        </h6>
                                        <span className="text-xs text-secondary-light fw-medium">
                                            Member ID: <span className="text-primary-600">{selectedHistory.memberId}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap gap-2 pt-12 border-top border-neutral-200">
                                    <span className="badge bg-white text-secondary-light border border-neutral-200 px-12 py-6 radius-6 text-xs d-flex align-items-center gap-1">
                                        <Icon icon="solar:map-point-bold-duotone" className="text-danger-600" />
                                        {selectedHistory.chapterName || "-"}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                {/* Payment Date */}
                                <div className="mb-20">
                                    <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                                        Payment Date <span className="text-danger">*</span>
                                    </label>
                                    <StandardDatePicker
                                        name="paymentDate"
                                        value={editFormData.paymentDate}
                                        onChange={(e) => setEditFormData({ ...editFormData, paymentDate: e.target.value })}
                                        className="form-control radius-8"
                                        disabled={isUpdating}
                                    />
                                </div>

                                {/* Amount & Years */}
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
                                                value={editFormData.amount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "" || parseFloat(val) >= 0) {
                                                        setEditFormData({ ...editFormData, amount: val });
                                                        if (val) setEditFormErrors(prev => ({ ...prev, amount: "" }));
                                                    }
                                                }}
                                                min="0"
                                                disabled={isUpdating}
                                            />
                                        </div>
                                        {editFormErrors.amount && <span className="text-danger text-xs mt-1 d-block">{editFormErrors.amount}</span>}
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
                                                value={editFormData.years}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditFormData({ ...editFormData, years: val });
                                                    if (val) setEditFormErrors(prev => ({ ...prev, years: "" }));
                                                }}
                                                min="1"
                                                disabled={isUpdating}
                                            />
                                        </div>
                                        {editFormErrors.years && <span className="text-danger text-xs mt-1 d-block">{editFormErrors.years}</span>}
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="mb-20">
                                    <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                                        Payment Mode <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        options={transferModeOptions}
                                        value={editFormData.paymentMode}
                                        onChange={(opt) => {
                                            setEditFormData({
                                                ...editFormData,
                                                paymentMode: opt,
                                                transactionId: opt?.value === "Cash" ? "" : editFormData.transactionId,
                                            });
                                            if (opt) setEditFormErrors(prev => ({ ...prev, paymentMode: "" }));
                                        }}
                                        placeholder="Select payment method"
                                        styles={selectStyles()}
                                        isDisabled={isUpdating}
                                    />
                                    {editFormErrors.paymentMode && <span className="text-danger text-xs mt-1 d-block">{editFormErrors.paymentMode}</span>}
                                </div>

                                {/* Transaction ID */}
                                {(editFormData.paymentMode?.value === "UPI" ||
                                    editFormData.paymentMode?.value === "Bank Transfer" ||
                                    editFormData.paymentMode?.value === "Card") && (
                                        <div className="mb-24">
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
                                                    value={editFormData.transactionId}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setEditFormData({ ...editFormData, transactionId: val });
                                                        if (val) setEditFormErrors(prev => ({ ...prev, transactionId: "" }));
                                                    }}
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                            {editFormErrors.transactionId && <span className="text-danger text-xs mt-1 d-block">{editFormErrors.transactionId}</span>}
                                        </div>
                                    )}

                                {/* Action Buttons */}
                                <div className="d-flex align-items-center justify-content-end gap-3 pt-8">
                                    <button
                                        type="button"
                                        className="btn btn-outline-neutral-600 px-24 py-11 radius-8 fw-semibold"
                                        onClick={handleEditClose}
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-32 py-11 radius-8 fw-bold d-flex align-items-center gap-2"
                                        style={{ backgroundColor: "#003366", borderColor: "#003366", boxShadow: "0 4px 12px rgba(0, 51, 102, 0.2)" }}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="solar:check-circle-bold" className="text-xl" />
                                                Update
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
                onHide={() => setShowExcelModal(false)}
                contentClassName="radius-16 border-0"
            >
                <Modal.Header className="py-12 px-16 border-bottom border-neutral-200" style={{ backgroundColor: "#003366" }}>
                    <h6 className="fontsize-14 fw-bold mb-0 text-white">
                        Download Report
                    </h6>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowExcelModal(false)}
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
                                    onChange={(e) => setExcelDates(prev => ({ ...prev, fromDate: e.target.value }))}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">To Date</label>
                                <StandardDatePicker
                                    name="toDate"
                                    value={excelDates.toDate}
                                    onChange={(e) => setExcelDates(prev => ({ ...prev, toDate: e.target.value }))}
                                    minDate={excelDates.fromDate}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">Format</label>
                                <Select
                                    options={[
                                        { value: "csv", label: "Excel" },
                                        { value: "pdf", label: "PDF" },
                                    ]}
                                    value={excelDates.format}
                                    onChange={(opt) => setExcelDates((prev) => ({ ...prev, format: opt }))}
                                    styles={selectStyles()}
                                    placeholder="Select Format"
                                />
                            </div>
                            <div className="col-12 mt-5 pt-2">
                                <Button
                                    type="submit"
                                    className="w-100 py-12 radius-8 fw-bold btn-primary"
                                    style={{ backgroundColor: "#003366", borderColor: "#003366" }}
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

export default RenewalHistoryLayer;
