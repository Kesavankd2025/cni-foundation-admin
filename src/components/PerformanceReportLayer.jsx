import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import ReportApi from "../Api/ReportApi";
import ChapterApi from "../Api/ChapterApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";
// import StandardDatePicker from "./StandardDatePicker";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ShowNotifications from "../helper/ShowNotifications";

const PerformanceReportLayer = () => {
    // Data states
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

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
    //     fromDate: "",
    //     toDate: "",
    // });
    const [excelErrors, setExcelErrors] = useState({});
    const { hasPermission } = usePermissions();

    // Options states
    const [chapterOptions, setChapterOptions] = useState([]);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [edOptions, setEdOptions] = useState([]);
    const [rdOptions, setRdOptions] = useState([]);

    // Period Filter Options
    const periodOptions = [
        { value: "current_month", label: "Current Month" },
        { value: "tenure_1", label: "Tenure 1" },
        { value: "tenure_2", label: "Tenure 2" },
        { value: "one_year", label: "One Year" },
        { value: "overall", label: "Over All" },
    ];

    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // Form Type Options
    const formTypeOptions = [
        { value: "one_to_one", label: "121" },
        { value: "referral", label: "Referral" },
        { value: "thank_you_slip", label: "Thank You Slip" },
        { value: "visitor", label: "Visitor" },
        { value: "training", label: "Training" },
        { value: "meeting", label: "Meeting" },
        { value: "chief_guest", label: "Chief Guest" },
        { value: "power_date", label: "Power Meet" },
    ];

    const [selectedFormType, setSelectedFormType] = useState(null);


    // Modal States
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);
    const [historyTotalRecords, setHistoryTotalRecords] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialOptions();
    }, []);

    useEffect(() => {
        if (selectedZone) {
            fetchChapters(selectedZone.value);
        } else {
            fetchChapters();
        }
    }, [selectedZone]);

    // NOTE: Removed automatic fetch useEffect. Fetching is now triggered manually or on page change if data already loaded.

    useEffect(() => {
        // If data has been loaded at least once (or valid formType is selected), we can support pagination
        if (selectedFormType && reportData.length >= 0 && (currentPage > 0 || rowsPerPage !== 10)) {
            fetchReport();
        }
    }, [currentPage, rowsPerPage, searchTerm,
        selectedChapter,
        selectedZone,
        selectedEd,
        selectedEd,
        selectedRd,
        selectedPeriod]);
    // Added rowsPerPage dependency to refetch when page size changes.
    // However, the main requirement is "submit button then only that api call". 
    // Pagination should probably work after the first search.
    // Let's refine: The user said "submit button then only that api call". 
    // So ONLY when submit is clicked, OR if we are paginating a previously submitted query.

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

    const fetchInitialOptions = async () => {
        try {
            const [zonesRes, edRes, rdRes] = await Promise.all([
                ZoneApi.getZone(),
                RegionApi.getRoleBasedUser("ed"),
                RegionApi.getRoleBasedUser("rd"),
            ]);

            if (zonesRes.status) {
                setZoneOptions(
                    zonesRes.response.data.map((z) => ({
                        value: z._id,
                        label: z.name,
                    })),
                );
            }
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
            console.error("Error fetching filter options:", error);
        }
    };

    const fetchReport = async () => {
        if (!selectedFormType) {
            toast.error("Please select a Form Type");
            return;
        }

        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: searchTerm,
                chapterId: selectedChapter?.value,
                zoneId: selectedZone?.value,
                edId: selectedEd?.value,
                rdId: selectedRd?.value,
                period: selectedPeriod?.value,
                formType: selectedFormType?.value
            };

            const res = await ReportApi.getPerformanceReport(params);
            if (res.status) {
                setReportData(res.response.data || []);
                setTotalRecords(res.response.total || 0);
                setTotalPages(res.response.totalPages || 0);
            } else {
                setReportData([]);
                setTotalRecords(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        setCurrentPage(0); // Reset to first page on new search
        fetchReport();
    }

    // Reuse history fetch from absent report? The user said "ui same copy".
    // I will assume history functionality is also needed and works similarly (member based).
    const fetchHistory = async (memberId) => {
        setHistoryLoading(true);
        try {
            const params = {
                page: historyPage,
                limit: historyRowsPerPage,
                search: ""
            };
            // Depending on the "Performance Report" context, the history endpoint might differ.
            // For now, I'll stick to member attendance history or similar, but since this is a generic "Performance Report",
            // the history might be specific to the "formType".
            // However, absent-proxy used `meetings/absent-proxy-history`.
            // I'll leave it as is for now or use `meetings/absent-proxy-history` as a placeholder 
            // until user clarifies if history should change based on formType.
            const res = await ReportApi.getMemberAttendanceHistory(memberId, params);
            if (res.status) {
                setHistoryData(res.response.data || []);
                setHistoryTotalRecords(res.response.total || 0);
                setHistoryTotalPages(res.response.totalPages || 0);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setHistoryLoading(false);
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
        setSelectedChapter(null);
        setSelectedZone(null);
        setSelectedEd(null);
        setSelectedRd(null);
        setSelectedPeriod(null);
        setSelectedFormType(null);
        setSearchTerm("");
        setCurrentPage(0);
        setReportData([]); // Clear data on reset
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
                period: selectedPeriod?.value,
                formType: selectedFormType?.value
            };
            */

            const payload = {
                format: excelDates.format?.value || "csv",
                search: searchTerm,
                chapterId: selectedChapter?.value,
                zoneId: selectedZone?.value,
                edId: selectedEd?.value,
                rdId: selectedRd?.value,
                period: selectedPeriod?.value,
                formType: selectedFormType?.value
            };

            const res = await ReportApi.excelPerformanceReport(payload);

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
                // a.download = `Performance_Report_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
                a.download = `Performance_Report.${extensions[format] || "csv"}`;
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
        //     fromDate: "",
        //     toDate: "",
        // });
        setExcelErrors({});
    };

    const handleViewHistory = (member) => {
        setSelectedMember(member);
        setShowHistoryModal(true);
        setHistoryPage(0);
    };

    const handleCloseHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedMember(null);
        setHistoryData([]);
    };

    const handleHistoryPageChange = (page) => {
        setHistoryPage(page);
    };

    const handleHistoryRowsPerPageChange = (e) => {
        setHistoryRowsPerPage(parseInt(e.target.value));
        setHistoryPage(0);
    }

    const handleViewProfile = (member) => {
        navigate('/view-profile', { state: { member } })
    }

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                    <h6 className="text-primary-600 pb-2 mb-0">Performance Report</h6>
                    <div className="d-flex align-items-center flex-wrap gap-3">
                        <div style={{ width: '200px' }}>
                            <Select
                                options={periodOptions}
                                value={selectedPeriod}
                                onChange={setSelectedPeriod}
                                placeholder="Select Period"
                                styles={selectStyles()}
                                isClearable
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
                    <div className="col-xl col-md-4 col-sm-6">
                        <Select
                            options={zoneOptions}
                            value={selectedZone}
                            onChange={setSelectedZone}
                            placeholder="Zone"
                            styles={selectStyles()}
                            isClearable
                        />
                    </div>
                    <div className="col-xl col-md-4 col-sm-6">
                        <Select
                            options={chapterOptions}
                            value={selectedChapter}
                            onChange={setSelectedChapter}
                            placeholder="Chapter"
                            styles={selectStyles()}
                            isClearable
                        />
                    </div>

                    <div className="col-xl col-md-4 col-sm-6">
                        <Select
                            options={edOptions}
                            value={selectedEd}
                            onChange={setSelectedEd}
                            placeholder="ED"
                            styles={selectStyles()}
                            isClearable
                        />
                    </div>
                    <div className="col-xl col-md-4 col-sm-6">
                        <Select
                            options={rdOptions}
                            value={selectedRd}
                            onChange={setSelectedRd}
                            placeholder="RD"
                            styles={selectStyles()}
                            isClearable
                        />
                    </div>

                    <div className="col-xl col-md-4 col-sm-6">
                        <Select
                            options={formTypeOptions}
                            value={selectedFormType}
                            onChange={setSelectedFormType}
                            placeholder="Form Type *"
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
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>S.No</th>
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>Name</th>
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>Number</th>
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>Zone</th>
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>Chapter Name</th>
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>Category</th>
                                <th scope="col" style={{ color: "black", fontWeight: '600' }}>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : reportData.length > 0 ? (
                                reportData.map((data, index) => (
                                    <tr key={data._id || index}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>{data.name || "-"}</td>
                                        <td>{data.number || "-"}</td>
                                        <td>{data.zone || "-"}</td>
                                        <td>{data.chapterName || "-"}</td>
                                        <td>{data.category || "-"}</td>
                                        <td className="text-center fw-bold">{data.count || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        {selectedFormType ? "No reports found." : "Please Select a Form Type and Click Submission."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="mt-24">
                        {hasPermission("Performance Report", "view") && reportData && reportData.length > 0 && (
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
                                    className={`form-control radius-8 ${excelErrors.toDate ? 'border-danger' : ''}`}
                                />
                                {excelErrors.toDate && (
                                    <span className="text-danger text-xs mt-1 d-block">{excelErrors.toDate}</span>
                                )}
                            </div>
                            */}
                            {(selectedZone || selectedChapter || selectedRd || selectedEd || selectedPeriod || selectedFormType) && (
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
                                            {selectedPeriod && (
                                                <div className="d-flex align-items-center gap-8">
                                                    <span className="text-secondary-light fontsize-8 fw-medium w-64-px">Period:</span>
                                                    <span className="text-primary-light fontsize-8 fw-semibold">{selectedPeriod.label}</span>
                                                </div>
                                            )}
                                            {selectedFormType && (
                                                <div className="d-flex align-items-center gap-8">
                                                    <span className="text-secondary-light fontsize-8 fw-medium w-64-px">Form Type:</span>
                                                    <span className="text-primary-light fontsize-8 fw-semibold">{selectedFormType.label}</span>
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

            {/* History Modal */}
            {showHistoryModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto', zIndex: 1100 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content radius-16 border-0 shadow-lg">
                            <div className="modal-header border-bottom py-16 px-24 bg-white">
                                <div className="d-flex align-items-center gap-2">
                                    <h6 className="modal-title fw-bold text-primary-600 mb-0">Meeting History</h6>
                                    {selectedMember && <span className="text-secondary-light text-sm">for {selectedMember.name}</span>}
                                </div>
                                <button type="button" className="btn-close" onClick={handleCloseHistoryModal}></button>
                            </div>
                            <div className="modal-body p-24">
                                <div className="table-responsive scroll-sm">
                                    <table className="table bordered-table sm-table mb-0">
                                        <thead>
                                            <tr>
                                                <th style={{ color: "black", fontWeight: '600' }}>Date</th>
                                                <th style={{ color: "black", fontWeight: '600' }}>Chapter</th>
                                                <th style={{ color: "black", fontWeight: '600' }}>Meeting Type</th>
                                                <th style={{ color: "black", fontWeight: '600' }}>Status</th>
                                                <th style={{ color: "black", fontWeight: '600' }}>Category</th>
                                                <th style={{ color: "black", fontWeight: '600' }}>Meeting Location</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyLoading ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">Loading history...</td>
                                                </tr>
                                            ) : historyData.length > 0 ? (
                                                historyData.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.meetingDate ? new Date(item.meetingDate).toLocaleDateString("en-GB") : "-"}</td>
                                                        <td>{item.chapterName || "-"}</td>
                                                        <td>{item.meetingType || "-"}</td>
                                                        <td>
                                                            <span className={`badge ${item.status === 'Present' ? 'bg-success-focus text-success-main' :
                                                                item.status === 'Absent' ? 'bg-danger-focus text-danger-main' :
                                                                    item.status === 'Proxy' ? 'bg-warning-focus text-warning-main' :
                                                                        'bg-neutral-200 text-secondary-light'
                                                                } radius-4 fw-medium px-8 py-4`}>
                                                                {item.status || "-"}
                                                            </span>
                                                        </td>
                                                        <td>{item.categoryName || "-"}</td>
                                                        <td>{item.location?.name || "-"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">No history found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-3">
                                    <TablePagination
                                        currentPage={historyPage}
                                        totalPages={historyTotalPages}
                                        onPageChange={handleHistoryPageChange}
                                        rowsPerPage={historyRowsPerPage}
                                        onRowsPerPageChange={handleHistoryRowsPerPageChange}
                                        totalRecords={historyTotalRecords}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PerformanceReportLayer;
