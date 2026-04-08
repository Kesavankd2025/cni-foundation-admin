import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BadgeApi from "../Api/BadgeApi";
import usePermissions from "../hook/usePermissions";
import TablePagination from "./TablePagination";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatLabel } from "../helper/TextHelper";

const BadgeAssignLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchHistory();
  }, [page, limit, debouncedSearchTerm]);

  const fetchHistory = async () => {
    try {
      const res = await BadgeApi.getBadgeAssignHistory(page, limit, debouncedSearchTerm);
      if (res.status) {
        setHistoryData(res.response.data);
        setTotalRecords(res.response.total);
      }
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  const totalPages = Math.ceil(totalRecords / limit);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h6 className="text-primary-600 mb-0">Badge Assign History</h6>
        <div className="d-flex align-items-center gap-2">
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
          {hasPermission("Badge Creation", "add") && (
            <Link
              to="/badge/assign/create"
              className="btn btn-primary text-sm btn-sm px-12 py-8 radius-8 d-flex align-items-center gap-2"
              
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Assign Badge
            </Link>
          )}
          <Link to="/badge" className="btn btn-outline-secondary text-sm btn-sm px-12 py-8 radius-8">
            Back to Badge
          </Link>
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Badge Name</th>
                <th scope="col">Image</th>
                <th scope="col">Assigned Type</th>
                <th scope="col">Assigned To</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {historyData.length > 0 ? (
                historyData.map((item, index) => (
                  <tr key={item._id}>
                    <td>{page * limit + index + 1}.</td>
                    <td>{item.badge?.name}</td>
                    <td>
                      <div className="w-40-px h-40-px rounded-circle overflow-hidden">
                        {item.badge?.badgeImage?.path ? (
                          <img
                            src={`${IMAGE_BASE_URL}/${item.badge.badgeImage.path}`}
                            alt={item.badge?.name}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="w-100 h-100 bg-neutral-200 d-flex align-items-center justify-content-center">
                            <Icon icon="ri:image-line" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatLabel(item.assignTo)}</td>
                    <td>
                      {item.assignedTo?.name || "-"}
                      {item.assignTo?.toLowerCase() !== "chapter" &&
                        item.assignedTo?.phoneNumber
                        ? ` - ${item.assignedTo.phoneNumber}`
                        : ""}
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
};

export default BadgeAssignLayer;
