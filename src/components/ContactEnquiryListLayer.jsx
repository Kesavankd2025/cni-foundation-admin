import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import TablePagination from "./TablePagination";
import ContactEnquiryApi from "../Api/ContactEnquiryApi";

const ContactEnquiryListLayer = () => {
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
      const response = await ContactEnquiryApi.getContactEnquiryList(
        currentPage,
        rowsPerPage,
        debouncedSearchTerm
      );
      if (response && response.status && response.response) {
        const data = response.response.data;
        setEnquiries(data || []);
        setTotalRecords(response.response.totalRecords || 0);
      } else {
        setEnquiries([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Failed to fetch contact enquiries", error);
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
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Contact Form Enquiries</h6>
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
                <th scope="col" style={{ color: "black", backgroundColor: "#003366", color: "white" }}>Date</th>
                <th scope="col" style={{ color: "black", backgroundColor: "#003366", color: "white" }}>Name</th>
                <th scope="col" style={{ color: "black", backgroundColor: "#003366", color: "white" }}>Email/Phone</th>
                <th scope="col" style={{ color: "black", backgroundColor: "#003366", color: "white" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-24">Loading...</td>
                </tr>
              ) : enquiries.length > 0 ? (
                enquiries.map((item, index) => (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.fullName}</td>
                    <td>
                      <div>{item.email}</div>
                      <div className="text-secondary-light">{item.phoneNumber}</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: "300px", whiteSpace: "normal" }}>
                        <strong>{item.subject}</strong><br />
                        {item.message}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-24">No enquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalRecords > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
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

export default ContactEnquiryListLayer;
