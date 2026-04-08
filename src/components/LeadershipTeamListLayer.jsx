import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LeadershipTeamApi from "../Api/LeadershipTeamApi";
import TablePagination from "./TablePagination";
import { IMAGE_BASE_URL } from "../Config/Index";

const LeadershipTeamListLayer = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchMembers();
    }, [currentPage, rowsPerPage, search]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await LeadershipTeamApi.getMemberList(currentPage, rowsPerPage, search);
            if (res.status && res.response) {
                setRecords(res.response.data || []);
                setTotalRecords(res.response.totalRecords || 0);
            }
        } catch (error) {
            console.error("Error fetching leadership team", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            try {
                const res = await LeadershipTeamApi.deleteMember(id);
                if (res.status) {
                    fetchMembers();
                }
            } catch (error) {
                console.error("Error deleting member", error);
            }
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <h6 className="text-primary-600 pb-2 mb-0">Leadership Team Management</h6>
                    <div className="navbar-search border radius-8 ms-20">
                        <input
                            type="text"
                            className="form-control radius-8"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <Link
                        to="/leadership-team-add"
                        className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                    >
                        <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
                        Add New
                    </Link>
                </div>
            </div>
            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col" style={{ color: "black" }}>S.No</th>
                                <th scope="col" style={{ color: "black" }}>Photo</th>
                                <th scope="col" style={{ color: "black" }}>Name</th>
                                <th scope="col" style={{ color: "black" }}>Role</th>
                                <th scope="col" style={{ color: "black" }}>Status</th>
                                <th scope="col" style={{ color: "black" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24">Loading...</td>
                                </tr>
                            ) : records.length > 0 ? (
                                records.map((record, index) => (
                                    <tr key={record._id}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>
                                            {record.image ? (
                                                <img
                                                    src={`${IMAGE_BASE_URL}/${record.image.path}`}
                                                    alt={record.name}
                                                    className="w-40-px h-40-px radius-8 object-fit-cover border"
                                                />
                                            ) : (
                                                <div className="w-40-px h-40-px radius-8 bg-neutral-200 d-flex align-items-center justify-content-center">
                                                    <Icon icon="solar:user-outline" className="text-xl text-secondary-light" />
                                                </div>
                                            )}
                                        </td>
                                        <td>{record.name}</td>
                                        <td>{record.roleData?.name || "N/A"}</td>
                                        <td>
                                            <span className={`badge ${record.status === 'Active' ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-24 py-4 radius-4 fw-medium text-sm`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-10">
                                                <Link
                                                    to={`/leadership-team-edit/${record._id}`}
                                                    className="bg-success-focus text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                >
                                                    <Icon icon="lucide:edit" className="icon text-xl" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(record._id)}
                                                    className="bg-danger-focus text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                                                >
                                                    <Icon icon="lucide:trash-2" className="icon text-xl" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-24">No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalRecords > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalRecords / rowsPerPage)}
                        onPageChange={(page) => setCurrentPage(page)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                        totalRecords={totalRecords}
                    />
                )}
            </div>
        </div>
    );
};

export default LeadershipTeamListLayer;
