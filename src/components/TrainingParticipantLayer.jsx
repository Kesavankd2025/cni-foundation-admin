import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import TrainingApi from "../Api/TrainingApi";
import TablePagination from "./TablePagination";
import { Modal, Button } from "react-bootstrap";
import { IMAGE_BASE_URL } from "../Config/Index";

const TrainingParticipantLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [participantSearchTerm, setParticipantSearchTerm] = useState("");
    const [participantCurrentPage, setParticipantCurrentPage] = useState(0);
    const [participantRowsPerPage, setParticipantRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);

    const [showProofModal, setShowProofModal] = useState(false);
    const [activeProof, setActiveProof] = useState(null);

    useEffect(() => {
        fetchTrainingDetails();
    }, [id]);

    useEffect(() => {
        fetchParticipants();
    }, [id, participantCurrentPage, participantRowsPerPage, participantSearchTerm]);

    const fetchTrainingDetails = async () => {
        try {
            const response = await TrainingApi.getTraining(id);
            if (response && response.status) {
                // Handle different response structures: { data: { ... } } or { response: { data: { ... } } }
                const trainingData = response.response?.data || response.response || response.data;
                setSelectedTraining(trainingData);
            }
        } catch (error) {
            console.error("Error fetching training details:", error);
        }
    };

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const response = await TrainingApi.getTrainingParticipants({
                trainingId: id,
                page: participantCurrentPage,
                limit: participantRowsPerPage,
                search: participantSearchTerm
            });
            if (response && response.status) {
                const resBody = response.response || response;
                const data = resBody.data;

                if (Array.isArray(data)) {
                    setParticipants(data);
                    setTotalRecords(resBody.total || data.length);
                } else if (data && data.docs && Array.isArray(data.docs)) {
                    setParticipants(data.docs);
                    setTotalRecords(data.total || data.docs.length);
                } else if (resBody.docs && Array.isArray(resBody.docs)) {
                    setParticipants(resBody.docs);
                    setTotalRecords(resBody.total || resBody.docs.length);
                }
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (participantId, newStatus, currentPaymentStatus) => {
        const payload = {
            status: newStatus,
            paymentStatus: currentPaymentStatus
        };

        // Optimistic Update
        setParticipants((prev) =>
            prev.map((p) => (p._id === participantId ? { ...p, status: newStatus } : p))
        );

        const response = await TrainingApi.updateParticipantStatus(participantId, payload);
        if (!response.status) {
            fetchParticipants(); // Sync if failed
        }
    };

    const handlePaymentUpdate = async (participantId, currentStatus, newPaymentStatus) => {
        const payload = {
            status: currentStatus,
            paymentStatus: newPaymentStatus
        };

        // Optimistic Update
        setParticipants((prev) =>
            prev.map((p) => (p._id === participantId ? { ...p, paymentStatus: newPaymentStatus } : p))
        );

        const response = await TrainingApi.updateParticipantStatus(participantId, payload);
        if (!response.status) {
            fetchParticipants(); // Sync if failed
        }
    };

    const handleDownloadProof = async (participant) => {
        try {
            const rawImg = participant?.paymentProofImage;
            const imgPath = typeof rawImg === 'string' ? rawImg : (rawImg?.path || rawImg?.Path);
            if (!imgPath) return;

            const imageUrl = `${IMAGE_BASE_URL}/${imgPath}`;
            const fileName = `Payment_Proof_${participant?.memberName || participant?.fullName || "Participant"}.png`
                .replace(/[^a-z0-9]/gi, "_");

            const response = await fetch(imageUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Proof download failed:", error);
        }
    };

    // We use server-side filtering now, but keeping this for safety or if data is small
    const filteredParticipants = participants;

    const totalParticipantRecords = totalRecords;
    const totalParticipantPages = Math.ceil(totalParticipantRecords / participantRowsPerPage);
    const paginatedParticipants = participants;

    const handleParticipantPageChange = (page) => {
        setParticipantCurrentPage(page);
    };

    const handleParticipantRowsPerPageChange = (e) => {
        setParticipantRowsPerPage(parseInt(e.target.value));
        setParticipantCurrentPage(0);
    };

    return (
        <div className="card h-100 p-0 radius-12 border-0 shadow-sm">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                    <h6 className="text-secondary-light fw-bold mb-0">
                        <span style={{ color: "#ba1b1d" }}>Training Participants</span> - {selectedTraining?.title || "Loading..."}
                    </h6>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="navbar-search" style={{ width: "250px" }}>
                        <input
                            type="text"
                            className="bg-base h-40-px w-100 radius-8 border-neutral-200"
                            placeholder="Search Participant..."
                            value={participantSearchTerm}
                            onChange={(e) => {
                                setParticipantSearchTerm(e.target.value);
                                setParticipantCurrentPage(0);
                            }}
                        />
                        <Icon icon="ion:search-outline" className="icon" />
                    </div>
                    <Button
                        variant="danger"
                        onClick={() => navigate(-1)}
                        className="btn-sm px-20 py-10 radius-8 d-flex align-items-center gap-2"
                        style={{ backgroundColor: "#ba1b1d", border: "none", fontWeight: "600", whiteSpace: "nowrap" }}
                    >
                        <Icon icon="solar:arrow-left-linear" width="18" />
                        Back
                    </Button>
                </div>
            </div>

            <div className="card-body" style={{ padding: "0.875rem 1.5rem" }}>
                <div className="table-responsive">
                    <table className="table bordered-table sm-table mb-0">
                        <thead style={{ backgroundColor: "#ba1b1d" }}>
                            <tr>
                                <th scope="col" className="text-center py-16" style={{ width: "80px", color: "white", fontWeight: "600", border: "none" }}>S.No</th>
                                <th scope="col" className="py-16" style={{ color: "white", fontWeight: "600", border: "none" }}>Chapter Name</th>
                                <th scope="col" className="py-16" style={{ color: "white", fontWeight: "600", border: "none" }}>Person Name</th>
                                <th scope="col" className="py-16" style={{ color: "white", fontWeight: "600", border: "none" }}>Category</th>
                                <th scope="col" className="py-16" style={{ color: "white", fontWeight: "600", border: "none" }}>Phone Number</th>
                                <th scope="col" className="py-16" style={{ color: "white", fontWeight: "600", border: "none" }}>Payment Proof</th>
                                <th scope="col" className="py-16 text-center" style={{ width: "160px", color: "white", fontWeight: "600", border: "none" }}>Status</th>
                                <th scope="col" className="py-16 text-center" style={{ width: "160px", color: "white", fontWeight: "600", border: "none" }}>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-48">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : participants.length > 0 ? (
                                participants.map((participant, index) => {
                                    // Handle different mapping styles found in the app
                                    const fullName = participant.memberName || participant.fullName || participant.member?.[0]?.fullName || "-";
                                    const chapterName = participant.chapterName || participant.member?.[0]?.chapterName || "-";
                                    const categoryName = participant.categoryName || participant.companyName || participant.member?.[0]?.companyName || "-";
                                    const phoneNumber = participant.phoneNumber || participant.member?.[0]?.phoneNumber || "-";

                                    return (
                                        <tr key={participant._id || participant.id || index} className="align-middle">
                                            <td className="text-center fw-medium text-secondary-light">
                                                {participantCurrentPage * participantRowsPerPage + index + 1}
                                            </td>
                                            <td>
                                                <span className="text-md fw-normal text-secondary-light">
                                                    {chapterName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md fw-bold" style={{ color: "#ba1b1d" }}>
                                                    {fullName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md fw-normal text-secondary-light">
                                                    {categoryName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md fw-normal text-secondary-light">
                                                    {phoneNumber}
                                                </span>
                                            </td>

                                            <td className="text-center">
                                                <div className="d-flex justify-content-center align-items-center">
                                                    {participant.paymentProofImage ? (
                                                        <div className="w-50-px h-50-px border p-2 rounded bg-white overflow-hidden">
                                                            <img
                                                                src={`${IMAGE_BASE_URL}/${participant.paymentProofImage?.path || participant.paymentProofImage}`}
                                                                alt="Payment Proof"
                                                                className="w-100 h-100 object-fit-cover cursor-pointer"
                                                                onError={(e) => {
                                                                    e.target.parentElement.outerHTML = `<div class="w-50-px h-50-px border d-flex align-items-center justify-content-center rounded bg-neutral-100 text-secondary-light fw-medium text-center" style="font-size: 10px;">No Image</div>`;
                                                                }}
                                                                onClick={() => {
                                                                    setActiveProof(participant);
                                                                    setShowProofModal(true);
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-50-px h-50-px border d-flex align-items-center justify-content-center rounded bg-neutral-100 text-secondary-light fw-medium text-center" style={{ fontSize: '10px' }}>
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {/* <td>
                                                <span className="text-md fw-normal text-secondary-light">
                                                    {phoneNumber}
                                                </span>
                                            </td> */}
                                            <td className="text-center">
                                                <select
                                                    className={`form-select form-select-sm radius-8 fw-medium text-center ${participant.status === "Approved"
                                                        ? "bg-success-50 text-success-600 border-success-200"
                                                        : participant.status === "Reject" || participant.status === "Rejected"
                                                            ? "bg-danger-50 text-danger-600 border-danger-200"
                                                            : "bg-neutral-50 text-neutral-600 border-neutral-200"
                                                        }`}
                                                    style={{ width: "130px", margin: "0 auto", cursor: "pointer" }}
                                                    value={participant.status || "Interested"}
                                                    onChange={(e) => handleStatusUpdate(participant._id, e.target.value, participant.paymentStatus || "Pending")}
                                                >
                                                    <option value="Approved">Approved</option>
                                                    <option value="Interested">Interested</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="text-center">
                                                <select
                                                    className={`form-select form-select-sm radius-8 fw-medium text-center ${participant.paymentStatus === "Paid"
                                                        ? "bg-success-50 text-success-600 border-success-200"
                                                        : participant.paymentStatus === "Pending"
                                                            ? "bg-neutral-50 text-neutral-600 border-neutral-200"
                                                            : "bg-danger-50 text-danger-600 border-danger-200"
                                                        }`}
                                                    style={{ width: "130px", margin: "0 auto", cursor: "pointer" }}
                                                    value={participant.paymentStatus || "Pending"}
                                                    onChange={(e) => handlePaymentUpdate(participant._id, participant.status || "Interested", e.target.value)}
                                                >
                                                    <option value="Paid">Paid</option>
                                                    <option value="Not Paid">Not Paid</option>
                                                    <option value="pending">Pending</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-48">
                                        <div className="d-flex flex-column align-items-center justify-content-center gap-2 opacity-50">
                                            <Icon icon="solar:users-group-two-rounded-bold-duotone" width="48" className="text-neutral-300" />
                                            <span className="text-secondary-light fw-medium">No participants found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-24 pb-24 border-top pt-20">
                    <TablePagination
                        currentPage={participantCurrentPage}
                        totalPages={totalParticipantPages}
                        onPageChange={handleParticipantPageChange}
                        rowsPerPage={participantRowsPerPage}
                        onRowsPerPageChange={handleParticipantRowsPerPageChange}
                        totalRecords={totalParticipantRecords}
                    />
                </div>
            </div>

            {/* Payment Proof Modal */}
            <Modal centered show={showProofModal} onHide={() => setShowProofModal(false)}>
                <Modal.Body className="p-0 radius-8 overflow-hidden">
                    {activeProof && (
                        <div className="text-center">
                            <div className="bg-primary-600 py-20 px-24 text-white">
                                <h5 className="text-white mb-0">Payment Proof</h5>
                                <p className="text-white text-xs mb-0 mt-1 opacity-75">
                                    {activeProof.memberName || activeProof.fullName || "Participant"}
                                </p>
                            </div>
                            <div className="p-40 bg-white">
                                <div className="d-flex justify-content-center mb-24">
                                    <div className="bg-white p-3 shadow-md rounded-12 d-inline-block border border-neutral-100">
                                        <img
                                            src={`${IMAGE_BASE_URL}/${activeProof.paymentProofImage?.path || activeProof.paymentProofImage}`}
                                            alt="Payment Proof"
                                            className="img-fluid"
                                            style={{ maxHeight: "400px", maxWidth: "100%" }}
                                            onError={(e) => {
                                                e.target.src = "https://placehold.co/400x400?text=Image+Not+Found";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    <Button
                                        variant="primary"
                                        className="w-100 py-10 radius-8 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleDownloadProof(activeProof)}
                                    >
                                        <Icon icon="mdi:download" className="text-lg" />
                                        Download Proof
                                    </Button>

                                    <Button variant="outline-secondary" className="w-100 py-10 radius-8" onClick={() => setShowProofModal(false)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TrainingParticipantLayer;
