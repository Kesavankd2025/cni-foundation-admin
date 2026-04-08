import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import RegionApi from "../Api/RegionApi";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";
import TablePagination from "./TablePagination";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";

const RegionListLayer = () => {
  const { hasPermission } = usePermissions();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchRegions();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await RegionApi.getRegion(currentPage, rowsPerPage, debouncedSearchTerm);
      if (response && response.status && response.response.data) {
        setRegions(response.response.data);
        setTotalRecords(response.response.total || response.response.data.length || 0);
      } else {
        setRegions([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to fetch regions");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (org) => {
    setOrgToDelete(org);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (orgToDelete) {
      const response = await RegionApi.statusUpdate(orgToDelete._id);
      if (response && response.status) {
        fetchRegions();
        setShowDeleteModal(false);
        setOrgToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setOrgToDelete(null);
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
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h6 className="text-primary-600 pb-2 mb-0">Region List</h6>
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
          {hasPermission("Region", "add") && (
            <Link
              to="/region/add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

            >
              <Icon icon="ic:baseline-plus" className="text-xl" />
              Add Region
            </Link>
          )}
        </div>
      </div>

      {/* <div className="p-24 pb-0">
        <div className="row gy-3 gx-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label fw-semibold text-secondary-light">Country</label>
            <Select
              options={filterOptions.countries}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="All"
              isClearable
              styles={selectStyles()}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold text-secondary-light">State</label>
            <Select
              options={filterOptions.states}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="All"
              isClearable
              styles={selectStyles()}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold text-secondary-light">Zone</label>
            <Select
              options={filterOptions.zones}
              value={selectedZone}
              onChange={setSelectedZone}
              placeholder="All"
              isClearable
              styles={selectStyles()}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold text-secondary-light">ED Name</label>
            <Select
              options={filterOptions.eds}
              value={selectedED}
              onChange={setSelectedED}
              placeholder="All"
              isClearable
              styles={selectStyles()}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold text-secondary-light">Search</label>
            <form
              className="navbar-search w-100"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                className="bg-base h-40-px w-100 radius-8"
                name="search"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
              />
              <Icon icon="ion:search-outline" className="icon" />
            </form>
          </div>
        </div>
      </div> */}
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th
                  scope="col"

                  style={{ color: "black" }}
                >
                  S.No
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Country
                </th>
                <th scope="col" style={{ color: "black" }}>
                  State
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Zone
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Region
                </th>
                <th scope="col" style={{ color: "black" }}>
                  ED
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : regions.length > 0 ? (
                regions.map((org, index) => (
                  <tr key={org._id || index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {org.country}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {org.state}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {org.zoneName}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {org.region}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {org.edName}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {hasPermission("Region", "edit") && (
                          <Link
                            to={`/region/edit/${org._id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Region", "delete") && (
                          <button
                            onClick={() => confirmDelete(org)}
                            className={`remove-item-btn ${org.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon icon={org.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
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

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${orgToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={orgToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${orgToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {orgToDelete?.isActive === 1 ? "inactive" : "active"} this region?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant={orgToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={orgToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {orgToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RegionListLayer;
