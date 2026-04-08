import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import ChapterApi from "../Api/ChapterApi";
import RoleApi from "../Api/RoleApi";
import StandardDatePicker from "./StandardDatePicker";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import { formatDateTime } from "../helper/DateHelper";
import { IMAGE_BASE_URL } from "../Config/Index";

const ChapterRoleHistoryLayer = () => {
    const { id } = useParams();

    const [historyData, setHistoryData] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [chapterData, setChapterData] = useState(null);

    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        roleId: null,
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        fetchRoles();
        fetchChapterDetails();
    }, []);

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, currentPage, rowsPerPage, filters.startDate, filters.endDate, filters.roleId]);

    const fetchChapterDetails = async () => {
        try {
            const res = await ChapterApi.getChapter({ id });
            if (res.status) setChapterData(res.response.data);
        } catch (error) {
            console.error("Error fetching chapter details");
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await RoleApi.getRoles({
                search: "",
                roleType: "chapterRoles",
            });
            if (res.status) {
                setRoleOptions([
                    { value: "", label: "All Roles" },
                    ...res.response.data.map((r) => ({ value: r._id, label: r.name })),
                ]);
            }
        } catch (error) {
            console.error("Error fetching roles");
        }
    };

    const fetchHistory = async (overrideFilters = null) => {
        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
            };

            const currentFilters = overrideFilters || filters;

            if (currentFilters.startDate) params.startDate = currentFilters.startDate;
            if (currentFilters.endDate) params.endDate = currentFilters.endDate;
            if (currentFilters.roleId && currentFilters.roleId.value) params.roleId = currentFilters.roleId.value;

            const res = await ChapterApi.getChapterRolesHistory(id, params);
            if (res.status && res.response.data) {
                setHistoryData(res.response.data);
                setTotalRecords(res.response.total || res.response.data.length);
            } else {
                setHistoryData([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error(error);
            setHistoryData([]);
        }
    };



    const handleClearFilters = () => {
        const emptyFilters = { startDate: "", endDate: "", roleId: null };
        setFilters(emptyFilters);
        setCurrentPage(0);
        fetchHistory(emptyFilters);
    };

    const handlePageChange = (page) => setCurrentPage(page);
    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(0);
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                    <h6 className="text-primary-600 mb-0">Chapter Roles History</h6>
                    {chapterData && (
                        <span className="badge bg-primary-50 text-primary-600 radius-4 px-12 py-6 text-sm">
                            {chapterData.chapterName}
                        </span>
                    )}
                </div>
                <Link
                    to={`/chapter-roles/${id}`}
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 radius-8"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl" /> Back
                </Link>
            </div>

            <div className="card-body p-24">
                {/* Filters */}
                <div className="row gy-3 mb-24 d-flex align-items-end">
                    <div className="col-lg-3 col-md-4">
                        <label className="form-label fw-semibold">Start Date</label>
                        <StandardDatePicker
                            name="startDate"
                            value={filters.startDate}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, startDate: e.target.value }));
                                setCurrentPage(0);
                            }}
                            placeholder="Start Date"
                        />
                    </div>
                    <div className="col-lg-3 col-md-4">
                        <label className="form-label fw-semibold">End Date</label>
                        <StandardDatePicker
                            name="endDate"
                            value={filters.endDate}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, endDate: e.target.value }));
                                setCurrentPage(0);
                            }}
                            placeholder="End Date"
                            minDate={filters.startDate}
                        />
                    </div>
                    <div className="col-lg-4 col-md-4">
                        <label className="form-label fw-semibold">Role</label>
                        <Select
                            options={roleOptions}
                            value={filters.roleId}
                            onChange={(option) => {
                                setFilters(prev => ({ ...prev, roleId: option }));
                                setCurrentPage(0);
                            }}
                            placeholder="All Roles"
                            styles={selectStyles({})}
                        />
                    </div>
                    <div className="col-lg-2 col-md-12  d-flex gap-2">
                        <button type="button" className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleClearFilters}>
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive rounded-8">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col" style={{ color: "black" }}>S.No</th>
                                <th scope="col" style={{ color: "black" }}>Name</th>
                                <th scope="col" style={{ color: "black" }}>Company Name</th>
                                <th scope="col" style={{ color: "black" }}>Phone Number</th>
                                <th scope="col" style={{ color: "black" }}>Role</th>
                                <th scope="col" style={{ color: "black" }}>Start Date</th>
                                <th scope="col" style={{ color: "black" }}>End Date</th>
                                {/* <th scope="col" style={{ color: "black" }}>Status</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.length > 0 ? (
                                historyData.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>
                                            {item.member ? (
                                                <div className="d-flex align-items-center">
                                                    {item.member.profileImage?.path || (typeof item.member.profileImage === "string" && item.member.profileImage) ? (
                                                        <img
                                                            src={
                                                                item.member.profileImage?.path
                                                                    ? `${IMAGE_BASE_URL}/${item.member.profileImage.path}`
                                                                    : `${IMAGE_BASE_URL}/${item.member.profileImage}`
                                                            }
                                                            alt=""
                                                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                                                            onError={(e) => {
                                                                const name = item.member.fullName || "M";
                                                                const initial = name.charAt(0).toUpperCase();
                                                                e.target.outerHTML = `<div class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg"
                                                        >
                                                            {item.member.fullName?.charAt(0).toUpperCase() || "M"}
                                                        </div>
                                                    )}
                                                    <div className="flex-grow-1">
                                                        <span className="text-md mb-0 fw-normal text-secondary-light d-block">
                                                            {item.member.fullName || "Unknown"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                        <td>{item.member?.companyName || "N/A"}</td>
                                        <td>{item.member?.phoneNumber || "N/A"}</td>
                                        <td>{item.roleName}</td>
                                        <td>{item.startDate ? formatDateTime(item.startDate) : "-"}</td>
                                        <td>{item.endDate ? formatDateTime(item.endDate) : "Present"}</td>
                                        {/* <td>
                                            <span className={`badge ${item.isActive === 1 ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"} px-12 py-4 radius-4`}>
                                                {item.isActive === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </td> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">No history records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalRecords > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalRecords / rowsPerPage)}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        totalRecords={totalRecords}
                    />
                )}
            </div>
        </div>
    );
};

export default ChapterRoleHistoryLayer;
