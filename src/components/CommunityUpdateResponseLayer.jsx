import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CommunityApi from "../Api/CommunityUpdateApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDateTime, formatDate } from "../helper/DateHelper";
import TablePagination from "./TablePagination";

const CommunityUpdateResponseLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updateType, setUpdateType] = useState("");
    const [updateName, setUpdateName] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        if (id) {
            fetchResponses();
        }
    }, [id, currentPage, rowsPerPage]);

    const fetchResponses = async () => {
        setLoading(true);
        try {
            const res = await CommunityApi.getCommunityResponseDetails(id);
            if (res.status) {
                const data = res.response.data || [];
                setResponses(data);
                setTotalRecords(res.response.total || data.length || 0);

                if (data.length > 0) {
                    setUpdateType(data[0].type || "");
                    setUpdateName(data[0].createdBy?.fullName || data[0].fullName || "");
                }
            }
        } catch (error) {
            console.error("Error fetching community responses:", error);
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
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <h6 className="text-primary-600 mb-0">
                        Community Response
                        {updateType && <> - <span className="text-success-600">{updateType.charAt(0).toUpperCase() + updateType.slice(1)}</span></>}
                        {updateName && <> - <span className="text-secondary-light">({updateName})</span></>}
                    </h6>

                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 radius-8"
                    >
                        <Icon icon="lucide:arrow-left" /> Back
                    </button>
                </div>
            </div>

            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr className="bg-light">
                                <th scope="col">S.No</th>
                                <th scope="col">Profile</th>
                                <th scope="col">Member Name</th>
                                <th scope="col">Chapter</th>
                                <th scope="col">Zone</th>
                                <th scope="col">Region</th>
                                <th scope="col">Contact</th>
                                <th scope="col">Responded At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : responses.length > 0 ? (
                                responses.map((res, index) => {
                                    const imageSrc = res.profile?.path
                                        ? `${IMAGE_BASE_URL}/${res.profile.path}`
                                        : res.profileImage?.path
                                            ? `${IMAGE_BASE_URL}/${res.profileImage.path}`
                                            : res.profileImage && typeof res.profileImage === 'string'
                                                ? `${IMAGE_BASE_URL}/${res.profileImage}`
                                                : null;

                                    const firstLetter = res.username ? res.username.charAt(0).toUpperCase() : "U";

                                    return (
                                        <tr key={res._id || index}>
                                            <td>{currentPage * rowsPerPage + index + 1}</td>
                                            <td>
                                                {imageSrc && (
                                                    <img
                                                        src={imageSrc}
                                                        alt={res.username}
                                                        className="w-40-px h-40-px rounded-circle object-fit-cover border"
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                            if (e.target.nextSibling) {
                                                                e.target.nextSibling.style.display = "flex";
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <div
                                                    className="w-40-px h-40-px rounded-circle border align-items-center justify-content-center bg-primary-100 fw-bold text-primary-600"
                                                    style={{ display: imageSrc ? "none" : "flex", fontSize: "16px" }}
                                                >
                                                    {firstLetter}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="text-md fw-medium text-primary-600">
                                                        {res.username}
                                                    </span>
                                                    <span className="text-xs text-secondary-light">
                                                        {res.edName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{res.chapter}</td>
                                            <td>{res.zone}</td>
                                            <td>{res.region}</td>
                                            <td>{res.contactNumber}</td>
                                            <td>{formatDateTime(res.respondedAt)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        No responses found.
                                    </td>
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
        </div >
    );
};

export default CommunityUpdateResponseLayer;
