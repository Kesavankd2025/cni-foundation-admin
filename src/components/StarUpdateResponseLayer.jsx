import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarUpdateApi from "../Api/StarUpdateApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDateTime, formatDate } from "../helper/DateHelper";
import TablePagination from "./TablePagination";

const StarUpdateResponseLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [responses, setResponses] = useState([]);
    const [updateDetails, setUpdateDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, currentPage, rowsPerPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [responseRes, detailsRes] = await Promise.all([
                StarUpdateApi.getStarHubUpdateResponses(id),
                StarUpdateApi.getStarHubUpdateFullDetails(id)
            ]);

            if (responseRes.status) {
                setResponses(responseRes.response.data || []);
                setTotalRecords(responseRes.response.total || responseRes.response.data.length || 0);
            }

            if (detailsRes.status) {
                setUpdateDetails(detailsRes.response.data);
            }
        } catch (error) {
            console.error("Error fetching CNI Projects responses:", error);
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
                <div className="d-flex justify-content-between align-items-center w-100">
                    <h6 className="text-primary-600 mb-0">
                        CNI Projects Responses
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
                {updateDetails && (
                    <div className="radius-12 p-20 mb-24 border position-relative overflow-hidden shadow-sm"
                        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)", borderColor: "#FEE2E2" }}>
                        <div className="d-flex align-items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="radius-12 overflow-hidden border border-neutral-200 shadow-sm" style={{ width: "80px", height: "80px" }}>
                                    <img
                                        src={updateDetails.image ? `${IMAGE_BASE_URL}/${updateDetails.image.path || updateDetails.image}` : "/assets/images/user-grid/user-grid-img13.png"}
                                        alt={updateDetails.title}
                                        className="w-100 h-100 object-fit-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/images/user-grid/user-grid-img13.png";
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <h5 className="fw-bold mb-0 text-dark">{updateDetails.title}</h5>
                                <div className="d-flex flex-wrap align-items-center gap-x-4 gap-y-2 mt-1">
                                    <span className="d-flex align-items-center gap-1 text-secondary-light fontsize-10">
                                        <Icon icon="solar:calendar-bold-duotone" className="text-danger-600" />
                                        Created: {formatDate(updateDetails.createdAt)}
                                    </span>
                                    <span className="d-flex align-items-center gap-1 text-secondary-light fontsize-10">
                                        <Icon icon="solar:map-point-bold-duotone" className="text-danger-600" />
                                        {typeof updateDetails.location === "object" ? updateDetails.location?.name : updateDetails.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">S.No</th>
                                <th scope="col">Profile</th>
                                <th scope="col">Member Name</th>
                                <th scope="col">Chapter</th>
                                <th scope="col">Region</th>
                                <th scope="col">Business Category</th>
                                <th scope="col">Responded At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : responses.length > 0 ? (
                                responses.map((res, index) => (
                                    <tr key={res._id || index}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>
                                            <img
                                                src={
                                                    res.profile?.path
                                                        ? `${IMAGE_BASE_URL}/${res.profile.path}`
                                                        : res.profileImage?.path
                                                            ? `${IMAGE_BASE_URL}/${res.profileImage.path}`
                                                            : res.profileImage
                                                                ? `${IMAGE_BASE_URL}/${res.profileImage}`
                                                                : "/assets/images/user-list/user-list1.png"
                                                }
                                                alt={res.fullName}
                                                className="w-40-px h-40-px rounded-circle object-fit-cover border"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/assets/images/user-list/user-list1.png";
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <span className="text-primary-600 fw-semibold">
                                                {res.fullName}
                                            </span>
                                        </td>
                                        <td>{res.chapter}</td>
                                        <td>{res.region}</td>
                                        <td>{res.businessCategory}</td>
                                        <td>{formatDateTime(res.respondedAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
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
        </div>
    );
};

export default StarUpdateResponseLayer;
