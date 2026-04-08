import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useParams, useNavigate } from "react-router-dom";
import TablePagination from "./TablePagination";
import MemberApi from "../Api/MemberApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const ChapterMembersTableLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchMembers();
    }, [currentPage, rowsPerPage, debouncedSearchTerm, id]);

    const [isBackHovered, setIsBackHovered] = useState(false);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const res = await MemberApi.getMembers({
                currentPage,
                limit: rowsPerPage,
                search: debouncedSearchTerm,
                chapterId: id,
            });

            if (res.status) {
                const data = res.response.data;
                if (Array.isArray(data)) {
                    setMembers(data);
                    setTotalRecords(res.response.total || 0);
                } else if (data.docs) {
                    setMembers(data.docs);
                    setTotalRecords(res.response.total || 0);
                } else {
                    setMembers([]);
                    setTotalRecords(0);
                }
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
            setMembers([]);
            setTotalRecords(0);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(0);
    };

    return (
        <div className="card h-100 p-0 radius-12 border-0 shadow-sm mt-4">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <h6 className="text-primary-600 mb-0">Chapter Members</h6>
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
                    <button
                        onClick={() => navigate(-1)}
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
                    </button>
                </div>
            </div>
            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col" style={{ color: "black" }}>S.No</th>
                                <th scope="col" style={{ color: "black" }}>Member ID</th>
                                <th scope="col" style={{ color: "black" }}>Member Name</th>
                                <th scope="col" style={{ color: "black" }}>Chapter</th>
                                <th scope="col" style={{ color: "black" }}>Category</th>
                                <th scope="col" style={{ color: "black" }}>Region</th>
                                <th scope="col" style={{ color: "black" }}>Business</th>
                                <th scope="col" style={{ color: "black" }}>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                        Loading members...
                                    </td>
                                </tr>
                            ) : members.length > 0 ? (
                                members.map((member, index) => (
                                    <tr key={member._id || member.id}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>{member.membershipId}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {member.profileImage?.path || (typeof member.profileImage === "string" && member.profileImage) ? (
                                                    <img
                                                        src={
                                                            member.profileImage?.path
                                                                ? `${IMAGE_BASE_URL}/${member.profileImage.path}`
                                                                : `${IMAGE_BASE_URL}/${member.profileImage}`
                                                        }
                                                        alt=""
                                                        className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                                                        onError={(e) => {
                                                            const name = member.fullName || "M";
                                                            const initial = name.charAt(0).toUpperCase();
                                                            e.target.outerHTML = `<div class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg"
                                                    >
                                                        {member.fullName?.charAt(0).toUpperCase() || "M"}
                                                    </div>
                                                )}
                                                <div className="flex-grow-1">
                                                    <span className="text-md mb-0 fw-normal text-secondary-light d-block">
                                                        {member.fullName}
                                                    </span>
                                                    <span className="text-xs text-secondary-light fw-normal">
                                                        {member.phoneNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{member.chapterName || member.chapter || "-"}</td>
                                        <td>{member.businessCategoryName || member.businessCategory || "-"}</td>
                                        <td>{member.regionName || member.region || "-"}</td>
                                        <td>{member.companyName || "-"}</td>
                                        <td>
                                            <span
                                                className={`badge ${member.clubMemberType === "Diamond"
                                                    ? "bg-info-50 text-info-600"
                                                    : member.clubMemberType === "Platinum"
                                                        ? "bg-primary-50 text-primary-600"
                                                        : member.clubMemberType === "Gold"
                                                            ? "bg-warning-50 text-warning-600"
                                                            : "bg-secondary-50 text-secondary-600"
                                                    } px-12 py-4 radius-4`}
                                            >
                                                {member.clubMemberType || "Member"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">No members found.</td>
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

export default ChapterMembersTableLayer;
