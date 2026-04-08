import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import MemberApi from "../Api/MemberApi";
import TablePagination from "./TablePagination";
import { toast } from "react-toastify";
import { formatDate } from "../helper/DateHelper";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { Modal, Button } from "react-bootstrap";
// import StandardDatePicker from "./StandardDatePicker";
import ShowNotifications from "../helper/ShowNotifications";

const WebsiteMemberListLayer = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);

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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await MemberApi.getMemberEnquiries(currentPage, rowsPerPage, debouncedSearchTerm);

            if (res.status && res.response) {
                setData(res.response.data || []);
                setTotalRecords(res.response.total || 0);
            } else {
                setData([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error("Error fetching member enquiries:", error);
            toast.error("Failed to load member enquiries");
            setData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [currentPage, rowsPerPage, debouncedSearchTerm]);

    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(0);
    };

    /*
    const handleExcelDateChange = (e) => {
        const { name, value } = e.target;
        setExcelDates((prev) => {
            const newState = { ...prev, [name]: value };

            // If fromDate is changed, check if toDate is still valid
            if (name === "fromDate" && newState.toDate && new Date(value) > new Date(newState.toDate)) {
                newState.toDate = ""; // Clear invalid toDate
            }

            return newState;
        });

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

        if (excelDates.fromDate && excelDates.toDate) {
            if (new Date(excelDates.fromDate) > new Date(excelDates.toDate)) {
                errors.toDate = "To Date cannot be earlier than From Date";
            }
        }

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
            };
            */

            const payload = {
                format: excelDates.format?.value || "csv",
            }

            const res = await MemberApi.exportMemberEnquiries(payload);

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
                // a.download = `Member_Enquiries_${formattedDates.fromDate}_to_${formattedDates.toDate}.${extensions[format] || "csv"}`;
                a.download = `Member_Enquiries.${extensions[format] || "csv"}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                ShowNotifications.showAlertNotification(
                    "Report downloaded successfully.",
                    true
                );
                handleCloseExcel();
            } else {
                ShowNotifications.showAlertNotification(
                    "Failed to download report.",
                    false
                );
            }
        } catch (err) {
            console.error(err);
            ShowNotifications.showAlertNotification(
                "Something went wrong while downloading the report.",
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
        // setExcelErrors({ fromDate: "", toDate: "" });
        setExcelErrors({});
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <h6 className="text-primary-600 mb-0">Website Member Enquiries</h6>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-3">
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
                </div>
            </div>
            <div className="card-body p-24">
                <div className="table-responsive">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">S.No</th>
                                <th scope="col">Full Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Phone Number</th>
                                <th scope="col">Company Name</th>
                                <th scope="col">Category</th>
                                <th scope="col">Position</th>
                                <th scope="col">Date of Birth</th>
                                <th scope="col">Anniversary</th>
                                <th scope="col">City</th>
                                <th scope="col">State</th>
                                <th scope="col">Enquiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-24">
                                        Loading enquiries...
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.id || item._id}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>{item.fullName}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phoneNumber}</td>
                                        <td>{item.companyName}</td>
                                        <td>{item.businessCategory || "-"}</td>
                                        <td>{item.position || "-"}</td>
                                        <td>{item.dateOfBirth ? formatDate(item.dateOfBirth) : "-"}</td>
                                        <td>{item.anniversary ? formatDate(item.anniversary) : "-"}</td>
                                        <td>{item.address?.city || "-"}</td>
                                        <td>{item.address?.state || "-"}</td>
                                        <td>{formatDate(item.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="text-center py-24">
                                        No enquiries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {data.length > 0 && (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="mt-24">
                            <button
                                type="button"
                                className="btn btn-primary radius-8 px-20 py-11 d-flex align-items-center gap-2"
                                onClick={() => setShowExcelModal(true)}
                            >
                                <Icon icon="lucide:download" className="text-xl" />
                                Report
                            </button>
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
                )}
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
                                    minDate={excelDates.fromDate}
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

export default WebsiteMemberListLayer;

