import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogApi from "../Api/BlogApi";
import MediaCategoryApi from "../Api/MediaCategoryApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import TablePagination from "./TablePagination";
import { formatDate } from "../helper/DateHelper";
import Select from "react-select";

const BlogNewsListLayer = () => {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, rowsPerPage, search, selectedCategory]);

  const fetchInitialData = async () => {
    try {
      const res = await MediaCategoryApi.getAllCategories();
      if (res.status && res.response) {
        setCategories(res.response.data || res.response);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const categoryId = selectedCategory ? selectedCategory.value : "";
      const res = await BlogApi.getBlogList(currentPage, rowsPerPage, search, categoryId);
      if (res.status && res.response) {
        const data = res.response.data;
        setRecords(data || []);
        setTotalRecords(res.response.total || (data ? data.length : 0));
      }
    } catch (error) {
      console.error("Error fetching media", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this media entry?")) {
      try {
        const res = await BlogApi.deleteBlog(id);
        if (res.status) {
          fetchBlogs();
        }
      } catch (error) {
        console.error("Error deleting media", error);
      }
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat._id,
    label: cat.name
  }));

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Media Management</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <Link
            to="/blog-news-add"
            className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
            Add New
          </Link>
        </div>
      </div>
      <div className="card-body p-24">
        {/* Filter Section */}
        <div className="row mb-24 gy-3">
          <div className="col-md-4">
            <label className="form-label text-sm fw-semibold">Search Media</label>
            <div className="input-group">
                <span className="input-group-text bg-base border-end-0"><Icon icon="ri:search-line" /></span>
                <input
                    type="text"
                    className="form-control radius-8 border-start-0"
                    placeholder="Search by title, location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label text-sm fw-semibold">Filter by Category</label>
            <Select
                options={categoryOptions}
                isClearable
                placeholder="All Categories"
                value={selectedCategory}
                onChange={(option) => setSelectedCategory(option)}
                className="radius-8"
            />
          </div>
        </div>

        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ color: "black" }}>S.No</th>
                <th scope="col" style={{ color: "black" }}>Media Details</th>
                <th scope="col" style={{ color: "black" }}>Category</th>
                <th scope="col" style={{ color: "black" }}>Date/Time</th>
                <th scope="col" style={{ color: "black" }}>Status</th>
                <th scope="col" style={{ color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-24">Loading...</td>
                </tr>
              ) : records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={record._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-12">
                        {record.image && (
                          <img
                            src={`${IMAGE_BASE_URL}/${record.image.path}`}
                            alt={record.title}
                            className="w-44-px h-44-px rounded-circle object-fit-cover border"
                          />
                        )}
                        <div className="d-flex flex-column">
                          <span className="text-md mb-0 fw-bold text-secondary-light">
                            {record.title}
                          </span>
                          <span className="text-xs text-secondary-light">
                            {record.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-secondary-light fw-medium">
                        {record.category?.name || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-sm text-secondary-light">
                          {formatDate(record.publishDate)}
                        </span>
                        <span className="text-xs text-secondary-light">
                            {record.startTime} - {record.endTime}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${record.status === 'Active' ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-24 py-4 radius-4 fw-medium text-sm`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        <Link
                          to={`/blog-news-edit/${record._id}`}
                          className="bg-success-focus text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon icon="lucide:edit" className="icon text-xl" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(record._id)}
                          className="bg-danger-focus text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                        >
                          <Icon icon="lucide:trash-2" className="icon text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-24">No records found.</td>
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
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            totalRecords={totalRecords}
          />
        )}
      </div>
    </div>
  );
};

export default BlogNewsListLayer;
