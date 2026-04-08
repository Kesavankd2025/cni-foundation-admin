import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GalleryApi from "../Api/GalleryApi";
import TablePagination from "./TablePagination";
import { IMAGE_BASE_URL } from "../Config/Index";

const GalleryListLayer = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchGallery();
    }, [currentPage, rowsPerPage, search]);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const res = await GalleryApi.getGallery({
                page: currentPage,
                limit: rowsPerPage,
                search: search
            });
            if (res.status && res.response) {
                setRecords(res.response.data || []);
                setTotalRecords(res.response.total || 0);
            }
        } catch (error) {
            console.error("Error fetching gallery", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this gallery entry?")) {
            try {
                const res = await GalleryApi.deleteGallery(id);
                if (res.status) {
                    fetchGallery();
                }
            } catch (error) {
                console.error("Error deleting gallery", error);
            }
        }
    };

    return (
        <div className="card h-100 p-0 radius-12 shadow-sm border-0">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <h6 className="text-primary-600 pb-2 mb-0">Photo & Video Gallery</h6>
                    <div className="navbar-search border radius-8 ms-20 overflow-hidden" style={{ minWidth: "250px" }}>
                        <input
                            type="text"
                            className="form-control radius-8 border-0"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(0);
                            }}
                        />
                    </div>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <Link
                        to="/gallery-add"
                        className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2 fw-medium"
                    >
                        <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
                        Add Gallery Entry
                    </Link>
                </div>
            </div>
            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0 stripe-hover-table">
                        <thead>
                            <tr className="bg-neutral-50">
                                <th scope="col" className="fw-semibold text-secondary-light">S.No</th>
                                <th scope="col" className="fw-semibold text-secondary-light">Preview</th>
                                <th scope="col" className="fw-semibold text-secondary-light">Gallery Title</th>
                                <th scope="col" className="fw-semibold text-secondary-light">Type</th>
                                <th scope="col" className="fw-semibold text-secondary-light">Items</th>
                                <th scope="col" className="fw-semibold text-secondary-light">Status</th>
                                <th scope="col" className="fw-semibold text-secondary-light text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-40">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <span className="ms-8 text-neutral-400">Fetching records...</span>
                                    </td>
                                </tr>
                            ) : records.length > 0 ? (
                                records.map((record, index) => {
                                    const firstMedia = record.media && record.media[0];
                                    const isPhoto = record.type === "Photo";
                                    return (
                                        <tr key={record._id}>
                                            <td className="text-secondary-light fw-medium">{(currentPage * rowsPerPage) + index + 1}</td>
                                            <td>
                                                {isPhoto && firstMedia?.path ? (
                                                    <img 
                                                        src={`${IMAGE_BASE_URL}/${firstMedia.path}`} 
                                                        className="w-40-px h-40-px radius-8 object-fit-cover shadow-xxs border" 
                                                        alt="preview" 
                                                    />
                                                ) : (
                                                    <div className="w-40-px h-40-px radius-8 bg-neutral-100 d-flex align-items-center justify-content-center text-primary-light">
                                                        <Icon icon={isPhoto ? "solar:gallery-wide-linear" : "solar:video-frame-linear"} />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="text-md mb-0 fw-semibold text-secondary-light">{record.title}</span>
                                                    {record.isMultiple && <span className="text-xxs text-primary-600 bg-primary-50 px-8 py-2 radius-4 w-fit-content">Collection</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge px-12 py-6 radius-4 fw-medium text-xs ${record.type === 'Photo' ? 'bg-info-focus text-info-main' : 'bg-warning-focus text-warning-main'}`}>
                                                    <Icon icon={record.type === 'Photo' ? 'solar:camera-linear' : 'solar:video-camera-linear'} className="me-4" />
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs fw-medium text-neutral-500">
                                                    {record.media?.length || 0} items
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge px-16 py-4 radius-4 fw-medium text-xs ${record.status === 'Active' ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <Link
                                                        to={`/gallery-edit/${record._id}`}
                                                        className="bg-success-focus text-success-600 fw-medium w-36-px h-36-px d-flex justify-content-center align-items-center rounded-circle shadow-xxs hover-lift"
                                                        title="Edit Gallery"
                                                    >
                                                        <Icon icon="lucide:edit" className="text-lg" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(record._id)}
                                                        className="bg-danger-focus text-danger-600 fw-medium w-36-px h-36-px d-flex justify-content-center align-items-center rounded-circle border-0 shadow-xxs hover-lift"
                                                        title="Delete Gallery"
                                                    >
                                                        <Icon icon="lucide:trash-2" className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-40">
                                        <div className="flex-column d-flex align-items-center gap-12">
                                            <Icon icon="solar:folder-error-linear" className="text-4xl text-neutral-200" />
                                            <span className="text-neutral-400">No gallery entries found.</span>
                                        </div>
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
                        onPageChange={(page) => setCurrentPage(page)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value));
                            setCurrentPage(0);
                        }}
                        totalRecords={totalRecords}
                    />
                )}
            </div>
        </div>
    );
};

export default GalleryListLayer;
