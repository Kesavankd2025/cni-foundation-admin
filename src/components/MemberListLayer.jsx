import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import usePermissions from "../hook/usePermissions";
import MemberApi from "../Api/MemberApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const MemberListLayer = () => {
  const { hasPermission } = usePermissions();
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState("All");

  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

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
    fetchMembers();
  }, [currentPage, rowsPerPage, debouncedSearchTerm, selectedMembershipType]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await MemberApi.getMembers(
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
        selectedMembershipType !== "All" ? selectedMembershipType : undefined,
      );

      if (res.status) {
        const data = res.response.data;
        if (Array.isArray(data)) {
          setMembers(data);
          setTotalRecords(res.response.total || 0);
        } else if (data.docs) {
          setMembers(data.docs);
          setTotalRecords(res.response.total || 0);
        } else {
          setMembers([]);
          setTotalRecords(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch members", error);
      setMembers([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      const res = await MemberApi.statusUpdate(
        memberToDelete._id || memberToDelete.id,
      );
      if (res.status) {
        fetchMembers(); // Refresh list
        setShowDeleteModal(false);
        setMemberToDelete(null);
      }
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const membershipOptions = [
    { value: "All", label: "All Types" },
    { value: "Gold", label: "Gold" },
    { value: "Platinum", label: "Platinum" },
    { value: "Diamond", label: "Diamond" },
  ];

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Member List</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div style={{ width: "150px" }}>
            <Select
              options={membershipOptions}
              value={membershipOptions.find(
                (option) => option.value === selectedMembershipType,
              )}
              onChange={(selectedOption) => {
                setSelectedMembershipType(selectedOption.value);
                setCurrentPage(0);
              }}
              styles={selectStyles()}
              isSearchable={false}
              placeholder="Select Type"
            />
          </div>
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
          {hasPermission("Members Registration", "add") && (
            <Link
              to="/members-registration/add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Member
            </Link>
          )}
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
                  Member ID
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Member Name
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Chapter
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Category
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Region
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Business
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Type
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Loading members...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((member, index) => (
                  <tr key={member._id || member.id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>{member.membershipId}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {member.profileImage?.path || (typeof member.profileImage === "string" && member.profileImage) ? (
                          <img
                            src={
                              member.profileImage?.path
                                ? `${IMAGE_BASE_URL}/${member.profileImage.path}`
                                : `${IMAGE_BASE_URL}/${member.profileImage}`
                            }
                            alt=""
                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                            onError={(e) => {
                              const name = member.fullName || "M";
                              const initial = name.charAt(0).toUpperCase();
                              e.target.outerHTML = `<div class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                            }}
                          />
                        ) : (
                          <div
                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg"
                          >
                            {member.fullName?.charAt(0).toUpperCase() || "M"}
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <span className="text-md mb-0 fw-normal text-secondary-light d-block">
                            {member.fullName}
                          </span>
                          <span className="text-xs text-secondary-light fw-normal">
                            {member.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {member.chapterName || member.chapter || "-"}
                    </td>
                    <td>
                      {member.businessCategoryName ||
                        member.businessCategory ||
                        "-"}
                    </td>
                    <td>{member.regionName || member.region || "-"}</td>
                    <td>{member.companyName || "-"}</td>
                    <td>
                      <span
                        className={`badge ${member.clubMemberType === "Diamond"
                          ? "bg-info-50 text-info-600"
                          : member.clubMemberType === "Platinum"
                            ? "bg-primary-50 text-primary-600"
                            : member.clubMemberType === "Gold"
                              ? "bg-warning-50 text-warning-600"
                              : "bg-secondary-50 text-secondary-600"
                          } px-12 py-4 radius-4`}
                      >
                        {member.clubMemberType || "Member"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        {/* {hasPermission("Members Registration", "view") && (
                          <Link
                            to={`/members-registration/edit/${member._id || member.id}`}
                            className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon
                              icon="majesticons:eye-line"
                              className="icon text-xl"
                            />
                          </Link>
                        )} */}
                        {/* {hasPermission("Renewal Report", "view") && (
                          <Link
                            to={`/member/${member._id}/renewal-history`}
                            className="bg-warning-focus bg-hover-warning-200 text-warning-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            title="Renewal History"
                          >
                            <Icon
                              icon="solar:history-bold-duotone"
                              className="icon text-xl"
                            />
                          </Link>
                        )} */}
                        {hasPermission("Members Registration", "edit") && (
                          <Link
                            to={`/members-registration/edit/${member._id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Members Registration", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(member)}
                            className={`remove-item-btn ${member.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon icon={member.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No members found.
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

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${memberToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={memberToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${memberToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {memberToDelete?.isActive === 1 ? "inactive" : "active"} member "{memberToDelete?.fullName}"?
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
              variant={memberToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={memberToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {memberToDelete?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MemberListLayer;
