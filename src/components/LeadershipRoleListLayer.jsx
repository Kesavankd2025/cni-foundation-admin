import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LeadershipRoleApi from "../Api/LeadershipRoleApi";
import TablePagination from "./TablePagination";

const LeadershipRoleListLayer = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await LeadershipRoleApi.getAllRoles();
            if (res.status && res.response) {
                const data = res.response.data || res.response;
                setRecords(data);
                setTotalRecords(data.length);
            }
        } catch (error) {
            console.error("Error fetching leadership roles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                const res = await LeadershipRoleApi.deleteRole(id);
                if (res.status) {
                    fetchRoles();
                }
            } catch (error) {
                console.error("Error deleting leadership role", error);
            }
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <h6 className="text-primary-600 pb-2 mb-0">Leadership Role Management</h6>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <Link
                        to="/leadership-role-add"
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
                                <th scope="col" style={{ color: "black" }}>Role Name</th>
                                <th scope="col" style={{ color: "black" }}>Status</th>
                                <th scope="col" style={{ color: "black" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-24">Loading...</td>
                                </tr>
                            ) : records.length > 0 ? (
                                records.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((record, index) => (
                                    <tr key={record._id}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>{record.name}</td>
                                        <td>
                                            <span className={`badge ${record.status === 'Active' ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-24 py-4 radius-4 fw-medium text-sm`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-10">
                                                <Link
                                                    to={`/leadership-role-edit/${record._id}`}
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
                                    <td colSpan="4" className="text-center py-24">No records found.</td>
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

export default LeadershipRoleListLayer;
