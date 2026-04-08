
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TestimonialApi from "../Api/TestimonialApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { toast } from "react-toastify";
import TablePagination from "./TablePagination";

const TestimonialsListLayer = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRecords();
  }, [currentPage, rowsPerPage, search]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await TestimonialApi.getTestimonialList(currentPage, rowsPerPage, search);
      if (res.status) {
        setRecords(res.response.data || []);
        setTotalRecords(res.response.total || 0);
      }
    } catch (error) {
      console.error("Error fetching testimonials", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const res = await TestimonialApi.deleteTestimonial(id);
        if (res.status) {
          toast.success("Testimonial deleted successfully");
          fetchRecords();
        } else {
          toast.error(res.response?.message || "Failed to delete testimonial");
        }
      } catch (error) {
        toast.error("Error deleting testimonial");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Testimonials Management</h6>
          <div className="navbar-search ms-3">
            <input
              type="text"
              name="search"
              placeholder="Search by Name/Designation"
              className="bg-base h-40-px w-250-px radius-8 border px-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <Link
            to="/testimonials-add"
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
                <th scope="col" style={{ color: "black" }}>Image</th>
                <th scope="col" style={{ color: "black" }}>Customer Name</th>
                <th scope="col" style={{ color: "black" }}>Designation</th>
                <th scope="col" style={{ color: "black" }}>Message</th>
                <th scope="col" style={{ color: "black" }}>Status</th>
                <th scope="col" style={{ color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-24">
                    Loading...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((item, index) => (
                  <tr key={item._id}>
                    <td>{(currentPage * rowsPerPage) + index + 1}</td>
                    <td>
                      {item.image && item.image.path ? (
                        <img
                          src={`${IMAGE_BASE_URL}/${item.image.path}`}
                          alt={item.customerName}
                          className="w-40-px h-40-px radius-8 object-fit-cover"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{item.customerName}</td>
                    <td>{item.designation}</td>
                    <td>
                      <div className="text-wrap" style={{ maxWidth: "300px" }}>
                        {item.message?.length > 100 ? `${item.message.substring(0, 100)}...` : item.message}
                      </div>
                    </td>
                    <td>
                      {item.isActive ? (
                        <span className="bg-success-focus text-success-600 border border-success-main px-12 py-4 radius-4 fw-medium text-sm">
                          Active
                        </span>
                      ) : (
                        <span className="bg-neutral-200 text-neutral-600 border border-neutral-400 px-12 py-4 radius-4 fw-medium text-sm">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        <Link
                          to={`/testimonials-edit/${item._id}`}
                          className="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon icon="lucide:edit" className="text-xl" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                        >
                          <Icon icon="lucide:trash-2" className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-24">
                    No records found.
                  </td>
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

export default TestimonialsListLayer;
