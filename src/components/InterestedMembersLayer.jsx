import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import TablePagination from './TablePagination';
import ReportApi from '../Api/ReportApi';
import TrainingApi from '../Api/TrainingApi';
import ShowNotifications from '../helper/ShowNotifications';
import { selectStyles } from '../helper/SelectStyles';

const InterestedMembersLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // State
    const [attendanceFilter, setAttendanceFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [membersData, setMembersData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        fetchParticipants();
    }, [id, attendanceFilter, currentPage, rowsPerPage, debouncedSearchTerm]);

    const fetchParticipants = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const params = {
                trainingId: id,
                page: currentPage,
                limit: rowsPerPage,
                search: debouncedSearchTerm,
                statusFilter: attendanceFilter !== 'All' ? attendanceFilter : undefined
            };
            const res = await ReportApi.getTrainingAttendanceReport(id, params);
            if (res.status && res.response) {
                const data = res.response.data || [];
                setMembersData(data);
                setTotalRecords(res.response.total || 0);
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
            ShowNotifications.showAlertNotification("Failed to fetch participants.", false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (memberId, newStatus) => {
        try {
            setIsLoading(true);
            const res = await TrainingApi.updateParticipantStatus(memberId, {
                statusFilter: newStatus
            });

            if (res.status) {
                setEditingId(null);
                fetchParticipants();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            ShowNotifications.showAlertNotification("Failed to update status.", false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const res = await ReportApi.getTrainingAttendanceReport(id);

            if (res.status && res.data) {
                const blob = new Blob([res.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Training_Attendance_Report_${id}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                ShowNotifications.showAlertNotification("Report downloaded successfully.", true);
            } else {
                ShowNotifications.showAlertNotification("Failed to download report.", false);
            }
        } catch (error) {
            console.error("Download Error:", error);
            ShowNotifications.showAlertNotification("Something went wrong.", false);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = membersData.filter(member => {
        const name = member.memberName || member.fullName || member.member?.fullName || "";
        const mId = member.memberId || member.member?.memberId || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mId.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(0);
    };

    const handleFilterChange = (status) => {
        setAttendanceFilter(status);
        setCurrentPage(0);
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => navigate('/trainings-report')}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 radius-8"
                    >
                        <Icon icon="ion:arrow-back-outline" />
                        Back
                    </button>
                    <h6 className="text-primary-600 mb-0">Interested Members List</h6>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-3">
                    {/* <form className="navbar-search">
                        <input
                            type="text"
                            className="bg-base h-40-px w-auto"
                            name="search"
                            placeholder="Search name or ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Icon icon="ion:search-outline" className="icon" />
                    </form> */}
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-secondary-light fw-bold text-sm">Attendance:</span>
                        <div className="btn-group btn-group-sm radius-8 border p-1 bg-neutral-50" role="group">
                            {['All', 'Present', 'Absent', 'Not Updated'].map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`btn rounded-8 px-16 py-8 fw-bold transition-all duration-200 ${attendanceFilter === status ? 'btn-primary text-white border-0' : 'btn-ghost text-secondary-light border-0 hover-bg-neutral-100'}`}
                                    onClick={() => handleFilterChange(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body p-24">
                <div className="table-responsive">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr >
                                <th scope="col" className="text-white fw-bold">S.No</th>
                                <th scope="col" className="text-white fw-bold">Member ID</th>
                                <th scope="col" className="text-white fw-bold">Member Name</th>
                                <th scope="col" className="text-white fw-bold">Chapter</th>
                                <th scope="col" className="text-white fw-bold">Category</th>
                                <th scope="col" className="text-white fw-bold text-center">Meeting Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">Loading...</td>
                                </tr>
                            ) : membersData.length > 0 ? (
                                membersData.map((item, index) => {
                                    const status = item.meetingStatus || 'Not Updated';

                                    return (
                                        <tr key={item._id || item.id}>
                                            <td>
                                                <span className="text-md mb-0 fw-medium text-secondary-light">
                                                    {currentPage * rowsPerPage + index + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-bold text-danger-main">
                                                    {item.memberCode || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-medium text-dark">
                                                    {item.memberName || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {item.chapterName || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {item.categoryName || "-"}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    {editingId === (item._id || item.id) ? (
                                                        <select
                                                            className="form-select form-select-sm w-auto"
                                                            value={status}
                                                            onChange={(e) => handleStatusChange(item._id || item.id, e.target.value)}
                                                            autoFocus
                                                            onBlur={() => setEditingId(null)}
                                                        >
                                                            <option value="Present">Present</option>
                                                            <option value="Absent">Absent</option>
                                                            <option value="Not Updates">Not Updates</option>
                                                        </select>
                                                    ) : (
                                                        <>
                                                            <span className={`badge radius-4 px-12 py-6 text-sm ${status === 'Present' ? 'bg-success-focus text-success-main' :
                                                                status === 'Absent' ? 'bg-danger-focus text-danger-main' : 'bg-neutral-100 text-secondary-light'
                                                                }`}>
                                                                {status}
                                                            </span>
                                                            {/* <button
                                                                className="text-primary-600 border-0 bg-transparent p-0 edit-btn shadow-none"
                                                                onClick={() => setEditingId(item._id || item.id)}
                                                                title="Edit Status"
                                                            >
                                                                <Icon icon="solar:pen-bold" className="text-lg" />
                                                            </button> */}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        No members found.
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

export default InterestedMembersLayer;
