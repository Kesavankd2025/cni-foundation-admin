import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal, Button, Tabs, Tab } from "react-bootstrap";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import CommunityApi from "../Api/CommunityUpdateApi";
import ChapterApi from "../Api/ChapterApi";
import MemberApi from "../Api/MemberApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDate, formatDateTime } from "../helper/DateHelper";

const CommunityUpdateListLayer = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "ask";
  });

  const [chapterOptions, setChapterOptions] = useState([]);
  const [personOptions, setPersonOptions] = useState([]);

  const [filters, setFilters] = useState({
    person: null,
    chapter: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [window.location.search]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchCommunityData();
  }, [currentPage, rowsPerPage, activeTab, filters, debouncedSearchTerm]);

  const fetchFilterOptions = async () => {
    try {
      const chapterRes = await ChapterApi.getChapter(null, 0, 100, "");
      if (chapterRes.status) {
        const options = chapterRes.response.data.map((ch) => ({
          value: ch._id,
          label: ch.chapterName,
        }));
        setChapterOptions(options);
      }

      const memberRes = await MemberApi.getMembers(0, 100, "", undefined);
      if (memberRes.status) {
        const options = memberRes.response.data.map((m) => ({
          value: m._id,
          label: m.fullName,
        }));
        setPersonOptions(options);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchCommunityData = async () => {
    try {
      let typeParam = activeTab;
      if (activeTab === "required") typeParam = "requirement";

      const response = await CommunityApi.getCommunityList(
        currentPage,
        rowsPerPage,
        typeParam,
        filters.chapter?.value,
        filters.person?.value,
        debouncedSearchTerm,
      );

      if (response && response.status && response.response) {
        setData(response.response.data || []);
        setTotalRecords(response.response.total || 0);
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching community data:", error);
      setData([]);
      setTotalRecords(0);
    }
  };

  const handleFilterChange = (key, selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      [key]: selectedOption,
    }));
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

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsUpdating(true);
    try {
      const response = await CommunityApi.statusUpdate(itemToDelete._id || itemToDelete.id);
      if (response.status) {
        fetchCommunityData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleShowResponses = (id, name) => {
    navigate(`/community-update/responses/${id}`);
  };

  const handleTabSelect = (k) => {
    setActiveTab(k);
    setCurrentPage(0);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", k);
    navigate({ search: params.toString() }, { replace: true });
  };



  function renderTable(items) {
    return (
      <div className="table-responsive scroll-sm">
        <table className="table bordered-table sm-table mb-0">
          <thead>
            <tr>
              <th scope="col" style={{ color: "black" }}>
                S.No
              </th>
              <th scope="col" style={{ color: "black" }}>
                Date
              </th>
              <th scope="col" style={{ color: "black" }}>
                Chapter
              </th>
              <th scope="col" style={{ color: "black" }}>
                Name
              </th>
              <th scope="col" style={{ color: "black" }}>
                Title
              </th>
              <th scope="col" style={{ color: "black" }}>
                Details
              </th>
              <th scope="col" style={{ color: "black" }}>
                Response
              </th>
              <th scope="col" style={{ color: "black" }}>
                Status
              </th>
              <th scope="col" style={{ color: "black" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item._id}>
                  <td>{currentPage * rowsPerPage + index + 1}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.chapterName}</td>
                  <td>{item.name}</td>
                  <td>{item.title}</td>
                  <td
                    className="text-truncate"
                    style={{ maxWidth: "200px" }}
                    title={item.details}
                  >
                    {item.details}
                  </td>
                  <td>
                    <span
                      className="text-primary-600 fw-bold cursor-pointer text-decoration-underline"
                      onClick={() => handleShowResponses(item._id, item.name)}
                    >
                      {item.responseCount || 0}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${item.isActive === 1
                        ? "bg-success-50 text-success-600"
                        : "bg-danger-50 text-danger-600"
                        } px-12 py-4 radius-4`}
                    >
                      {item.isActive === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-10">
                      {hasPermission("Community Update", "delete") && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(item)}
                          className={`remove-item-btn ${item.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                        >
                          <Icon icon={item.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon text-xl" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-24">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <h6 className="text-primary-600 mb-0">Community Update</h6>
          </div>
        </div>
        <div className="row g-3 my-2 px-3">
          <div className="col-md-3">
            <Select
              placeholder="Chapter"
              options={chapterOptions}
              value={filters.chapter}
              onChange={(opt) => handleFilterChange("chapter", opt)}
              styles={selectStyles()}
              className="basic-single"
              classNamePrefix="select"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <Select
              placeholder="Select Member"
              options={personOptions}
              value={filters.person}
              onChange={(opt) => handleFilterChange("person", opt)}
              styles={selectStyles()}
              className="basic-single"
              classNamePrefix="select"
              isClearable
            />
          </div>
          <div className="col-md-3">
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
          </div>
        </div>

        <div className="card-body p-24">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="mb-3 custom-tabs"
          >
            <Tab eventKey="ask" title="Ask">
              {renderTable(data)}
            </Tab>
            <Tab eventKey="give" title="Give">
              {renderTable(data)}
            </Tab>
            <Tab eventKey="required" title="Required">
              {renderTable(data)}
            </Tab>
          </Tabs>

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

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${itemToDelete?.isActive === 1 ? "bg-danger-focus" : "bg-success-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={itemToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${itemToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {itemToDelete?.isActive === 1 ? "disable" : "enable"} this item?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseDelete}
            >
              Cancel
            </Button>
            <Button
              variant={itemToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              disabled={isUpdating}
              style={itemToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {isUpdating ? "Processing..." : itemToDelete?.isActive === 1 ? "Disable" : "Enable"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default CommunityUpdateListLayer;
