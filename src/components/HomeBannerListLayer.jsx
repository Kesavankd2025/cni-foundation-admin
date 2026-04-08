import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BannerApi from "../Api/BannerApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import TablePagination from "./TablePagination";

const HomeBannerListLayer = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, [currentPage, rowsPerPage]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await BannerApi.getBanners({
        page: currentPage,
        limit: rowsPerPage,
      });
      if (res.status && res.response) {
        const data = res.response.data;
        setRecords(data || []);
        setTotalRecords(res.response.total || (data ? data.length : 0));
      }
    } catch (error) {
      console.error("Error fetching banners", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const res = await BannerApi.deleteBanner(id);
        if (res.status) {
          fetchBanners();
        }
      } catch (error) {
        console.error("Error deleting banner", error);
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
          <h6 className="text-primary-600 pb-2 mb-0">Home Page Banner Management</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <Link
            to="/home-banner-add"
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
                <th scope="col" style={{ color: "black" }}>Title</th>
                <th scope="col" style={{ color: "black" }}>Sub Title</th>
                <th scope="col" style={{ color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-24">Loading...</td>
                </tr>
              ) : records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={record._id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      {record.bannerImage && (
                        <img
                          src={`${IMAGE_BASE_URL}/${record.bannerImage.path}`}
                          alt={record.title}
                          className="w-40-px h-40-px rounded-circle object-fit-cover"
                        />
                      )}
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {record.title || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light text-truncate d-inline-block" style={{ maxWidth: "250px" }} title={record.subTitle}>
                        {record.subTitle || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        <Link
                          to={`/home-banner-edit/${record._id}`}
                          className="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon icon="lucide:edit" className="menu-icon text-xl" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(record._id)}
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
                  <td colSpan="5" className="text-center py-24">No records found.</td>
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

export default HomeBannerListLayer;
