import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReportApi from "../Api/ReportApi";
import TablePagination from "./TablePagination";
import { Icon } from "@iconify/react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const MeetingHistoryLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (id) {
            fetchHistory();
        }
    }, [id, currentPage, rowsPerPage]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: "",
            };
            const res = await ReportApi.getMemberAttendanceHistory(id, params);
            if (res.status) {
                setHistoryData(res.response.data || []);
                setTotalRecords(res.response.total || 0);
                setTotalPages(res.response.totalPages || 0);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(0);
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex justify-content-between">
                <div className="d-flex align-items-center gap-2">

                    <h6 className="text-primary-600 mb-0">Meeting History</h6>
                </div>
                <button
                    className="btn btn-secondary radius-8 px-12 py-8 d-flex align-items-center gap-2"
                    onClick={() => navigate(-1)}
                >
                    <Icon icon="solar:arrow-left-outline" />
                    Back
                </button>
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
                                    Meeting Topic
                                </th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                                    Meeting Type
                                </th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                                    Chapter
                                </th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                                    Status
                                </th>
                                <th scope="col" style={{ color: "black", fontWeight: "600" }}>
                                    Category
                                </th>
                                {/* <th scope="col" style={{ color: "black", fontWeight: "600", maxWidth: "250px", whiteSpace: "normal" }}>
                                    Meeting Location
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        Loading history...
                                    </td>
                                </tr>
                            ) : historyData.length > 0 ? (
                                historyData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>
                                            {item.meetingDate
                                                ? new Date(item.meetingDate).toLocaleDateString("en-GB")
                                                : "-"}
                                        </td>
                                        <td>{item.meetingTopic || "-"}</td>
                                        <td>{item.meetingType || "-"}</td>
                                        <td>{item.chapterName || "-"}</td>
                                        <td>
                                            <span
                                                className={`badge ${item.status === "Present"
                                                    ? "bg-success-focus text-success-main"
                                                    : item.status === "Absent"
                                                        ? "bg-danger-focus text-danger-main"
                                                        : item.status === "Proxy"
                                                            ? "bg-warning-focus text-warning-main"
                                                            : "bg-neutral-200 text-secondary-light"
                                                    } radius-4 fw-medium px-8 py-4`}
                                            >
                                                {item.status || "-"}
                                            </span>
                                        </td>
                                        <td>{item.categoryName || "-"}</td>
                                        {/* <td style={{ maxWidth: "250px" }}>
                                            {item.location?.name ? (
                                                item.location.name.length > 20 ? (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id={`tooltip-${index}`}>{item.location.name}</Tooltip>}
                                                    >
                                                        <span className="cursor-pointer">
                                                            {item.location.name.substring(0, 20)}...
                                                        </span>
                                                    </OverlayTrigger>
                                                ) : (
                                                    item.location.name
                                                )
                                            ) : (
                                                "-"
                                            )}
                                        </td> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        No history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
    );
};

export default MeetingHistoryLayer;
