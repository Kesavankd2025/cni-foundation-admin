import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import EventApi from "../Api/EventApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDate } from "../helper/DateHelper";
import { toast } from "react-toastify";

const WebsiteEventListLayer = () => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);


    useEffect(() => {
        fetchData();
    }, [currentPage, rowsPerPage, debouncedSearchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await EventApi.getEventList(currentPage, rowsPerPage, debouncedSearchTerm);
            if (res.status && res.response) {
                setData(res.response.data || []);
                setTotalRecords(res.response.total || 0);
            } else {
                setData([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to fetch events");
            setData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => setCurrentPage(page);
    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(0);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            const res = await EventApi.deleteEvent(id);
            if (res.status) {
                toast.success("Event deleted successfully");
                fetchData();
            } else {
                toast.error(res.response?.message || "Failed to delete event");
            }
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="text-primary-600 mb-0">Website Events</h6>
                    <div className="d-flex align-items-center gap-3">
                        <form className="navbar-search" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="text"
                                className="bg-base h-40-px w-auto"
                                name="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Icon icon="ion:search-outline" className="icon" />
                        </form>
                        <Link to="/website-event-add" className="btn btn-primary-600">
                            Add Event
                        </Link>
                    </div>
                </div>
            </div>

            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">S.No</th>
                                <th scope="col">Event Date</th>
                                <th scope="col">Image</th>
                                <th scope="col">Title</th>
                                <th scope="col">Venue</th>
                                <th scope="col">Description</th>
                                <th scope="col">Created Date</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        Loading events...
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.id || item._id}>
                                        <td>{currentPage * rowsPerPage + index + 1}</td>
                                        <td>{formatDate(item.date)}</td>
                                        <td>
                                            {item.image ? (
                                                <img
                                                    src={`${IMAGE_BASE_URL}/${item.image.path}`}
                                                    alt={item.title}
                                                    className="w-40-px h-40-px rounded-circle object-fit-cover"
                                                />
                                            ) : (
                                                <div className="w-40-px h-40-px rounded-circle bg-neutral-200 d-flex align-items-center justify-content-center">
                                                    <Icon icon="solar:gallery-bold" className="text-secondary-light" />
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.title}</td>
                                        <td>{item.venue}</td>
                                        <td className="text-truncate" style={{ maxWidth: "200px" }} title={item.details}>
                                            {item.details}
                                        </td>
                                        <td>{formatDate(item.createdAt)}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-10">
                                                <Link
                                                    to={`/website-event-view/${item._id || item.id}`}
                                                    className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                >
                                                    <Icon icon="majesticons:eye-line" className="icon text-xl" />
                                                </Link>
                                                <Link
                                                    to={`/website-event-edit/${item._id || item.id}`}
                                                    className="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                >
                                                    <Icon icon="lucide:edit" className="menu-icon text-xl" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id || item.id)}
                                                    className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                                                >
                                                    <Icon icon="lucide:trash-2" className="menu-icon text-xl" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        No events found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalRecords / rowsPerPage)}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    totalRecords={totalRecords}
                />
            </div>
        </div>
    );
};

export default WebsiteEventListLayer;
