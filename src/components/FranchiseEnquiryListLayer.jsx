import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usePermissions from "../hook/usePermissions";
import TablePagination from "./TablePagination";
import FranchiseEnquiryApi from "../Api/FranchiseEnquiryApi";

const FranchiseEnquiryListLayer = () => {
    const { hasPermission } = usePermissions();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const response = await FranchiseEnquiryApi.getFranchiseEnquiryList(
                currentPage,
                rowsPerPage,
                debouncedSearchTerm
            );
            if (response && response.status && response.response) {
                const data = response.response.data;
                if (Array.isArray(data)) {
                    setEnquiries(data);
                    setTotalRecords(response.response.total || data.length || 0);
                } else if (data.docs) {
                    setEnquiries(data.docs);
                    setTotalRecords(response.response.total || data.total || 0);
                } else {
                    setEnquiries([]);
                    setTotalRecords(0);
                }
            } else {
                setEnquiries([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error("Failed to fetch franchise enquiries", error);
            setEnquiries([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, [currentPage, rowsPerPage, debouncedSearchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
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
        <>
            <div className="card h-100 p-0 radius-12">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                    <div className="d-flex align-items-center flex-wrap gap-3">
                        <h6 className="text-primary-600 pb-2 mb-0">Franchise Enquiries</h6>
                    </div>

                    <div className="d-flex align-items-center flex-wrap gap-3">
                        <form
                            className="navbar-search"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="text"
                                className="bg-base h-40-px w-auto"
                                name="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <Icon icon="ion:search-outline" className="icon" />
                        </form>
                    </div>
                </div>
                <div className="card-body p-24">
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table sm-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" style={{ color: "black" }}>
                                        S.No
                                    </th>
                                    <th scope="col" style={{ color: "black" }}>
                                        Name
                                    </th>
                                    <th scope="col" style={{ color: "black" }}>
                                        Email
                                    </th>
                                    <th scope="col" style={{ color: "black" }}>
                                        Contact Number
                                    </th>
                                    <th scope="col" style={{ color: "black" }}>
                                        Location
                                    </th>
                                    <th scope="col" style={{ color: "black" }}>
                                        Budget
                                    </th>
                                    <th scope="col" style={{ color: "black" }}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-24">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : enquiries.length > 0 ? (
                                    enquiries.map((item, index) => (
                                        <tr key={item._id}>
                                            <td>{currentPage * rowsPerPage + index + 1}</td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {item.fullName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {item.emailAddress}
                                                </span>
                                            </td>
                                            <td>{item.contactNumber}</td>
                                            <td>{item.proposedLocationForFranchise || "-"}</td>
                                            <td>{item.investmentBudgetApprox || "-"}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-10">
                                                    <Link
                                                        to={`/franchise-enquiry/view/${item._id}`}
                                                        className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    >
                                                        <Icon
                                                            icon="majesticons:eye-line"
                                                            className="icon text-xl"
                                                        />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-24">
                                            No enquiries found
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
        </>
    );
};

export default FranchiseEnquiryListLayer;
