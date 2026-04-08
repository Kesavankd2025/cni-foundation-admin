import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import MemberApi from "../Api/MemberApi";
import RoleApi from "../Api/RoleApi";
import ChapterApi from "../Api/ChapterApi";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import { selectStyles } from "../helper/SelectStyles";

const ChapterRoleAssignLayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roleOptions, setRoleOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [chapterData, setChapterData] = useState(null);
  const [formData, setFormData] = useState({
    role: null,
    member: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [roleToToggle, setRoleToToggle] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchChapterDetails();
    fetchRoles();
    fetchMembers();
    fetchAssignedRoles();
  }, [id]);

  const fetchChapterDetails = async () => {
    try {
      const res = await ChapterApi.getChapter({ id });
      if (res.status) {
        setChapterData(res.response.data);
      }
    } catch (error) {
      console.error("Error fetching chapter details", error);
    }
  };

  const fetchAssignedRoles = async () => {
    try {
      const res = await ChapterApi.getChapterRoles(id);
      if (res.status) {
        const data = res.response.data || res.response;
        setAssignedRoles(Array.isArray(data) ? data : (data.docs || []));
      }
    } catch (error) {
      console.error("Error fetching assigned roles", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await RoleApi.getRoles({
        search: "",
        roleType: "chapterRoles",
      })
      if (res.status) {
        setRoleOptions(
          res.response.data.map((r) => ({ value: r._id, label: r.name })),
        );
      }
    } catch (error) {
      console.error("Error fetching roles", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await MemberApi.getMembers({ chapterId: id });
      if (res.status) {
        setMemberOptions(
          res.response.data.map((m) => ({
            value: m._id,
            label: `${m.fullName} - ${m.phoneNumber}`,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching members", error);
    }
  };

  const handleChange = (selectedOption, { name }) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.role) newErrors.role = "Role is Required";
    if (!formData.member) newErrors.member = "Member is Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditMode) {
        const payload = {
          memberId: formData.member.value,
        };
        const res = await ChapterApi.updateChapterRole(editId, payload);
        if (res.status) {
          fetchAssignedRoles();
          setFormData({ role: null, member: null });
          setIsEditMode(false);
          setEditId(null);
        }
      } else {
        const payload = {
          chapterId: id,
          roleId: formData.role.value,
          memberId: formData.member.value,
        };
        const res = await ChapterApi.assignChapterRole(payload);
        if (res.status) {
          fetchAssignedRoles();
          setFormData({ role: null, member: null });
        }
      }
    } catch (error) {
      console.error("Error submitting role assignment", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      role: {
        value: item.roleId?._id || item.roleId,
        label: item.roleName || item.roleId?.name,
      },
      member: {
        value: item.member?._id || item.memberId?._id || item.memberId,
        label: item.member?.fullName || item.memberId?.fullName,
      },
    });
    setIsEditMode(true);
    setEditId(item._id);
  };

  const handleStatusToggleClick = (item) => {
    setRoleToToggle(item);
    setShowDeleteModal(true);
  };

  const handleStatusUpdate = async () => {
    if (roleToToggle) {
      try {
        const res = await ChapterApi.roleStatusUpdate(roleToToggle._id);
        if (res.status) {
          fetchAssignedRoles();
          setShowDeleteModal(false);
          setRoleToToggle(null);
        }
      } catch (error) {
        console.error("Error toggling role status", error);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setRoleToToggle(null);
  };

  const handleDeleteClick = (item) => {
    setRoleToDelete(item);
    setShowConfirmDeleteModal(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDeleteModal(false);
    setRoleToDelete(null);
  };

  const handleDelete = async () => {
    if (roleToDelete) {
      try {
        const res = await ChapterApi.deleteChapterRole(roleToDelete._id);
        if (res.status) {
          fetchAssignedRoles();
          setShowConfirmDeleteModal(false);
          setRoleToDelete(null);
        }
      } catch (error) {
        console.error("Error deleting role assignment", error);
      }
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <h6 className="text-primary-600 mb-0">Assign Chapter Roles</h6>
          {chapterData && (
            <span className="badge bg-primary-50 text-primary-600 radius-4 px-12 py-6 text-sm">
              {chapterData.chapterName}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to={`/chapter-roles/history/${id}`}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 radius-8"
          >
            <Icon icon="solar:history-bold" className="text-xl" />
            History
          </Link>
          <Link
            to="/chapter-creation"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 radius-8"
          >
            <Icon icon="mdi:arrow-left" className="text-xl" />
            Back
          </Link>
        </div>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit} className="mb-24">
          <div className="row gy-3">
            <div className="col-md-5">
              <label className="form-label fw-semibold">Role</label>
              <Select
                name="role"
                options={roleOptions}
                value={formData.role}
                onChange={handleChange}
                placeholder="Select Role"
                isDisabled={isEditMode}
                styles={selectStyles(errors.role)}
              />
              <div style={{ minHeight: '20px' }}>
                {errors.role && (
                  <small className="text-danger">{errors.role}</small>
                )}
              </div>
            </div>
            <div className="col-md-5">
              <label className="form-label fw-semibold">Member</label>
              <Select
                name="member"
                options={memberOptions}
                value={formData.member}
                onChange={handleChange}
                placeholder="Select Member"
                styles={selectStyles(errors.member)}
              />
              <div style={{ minHeight: '20px' }}>
                {errors.member && (
                  <small className="text-danger">{errors.member}</small>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label d-none d-md-block opacity-0">Submit</label>
              <button
                type="submit"
                className="btn btn-primary w-100 radius-8"

              >
                {isEditMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </form>

        <div className="table-responsive rounded-8">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ color: "black" }}>
                  S.No
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Role
                </th>
                <th scope="col" style={{ color: "black" }}>
                  Member
                </th>
                {/* <th scope="col" style={{ color: "black" }}>
                  Status
                </th> */}
                <th scope="col" style={{ color: "black" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedRoles.length > 0 ? (
                assignedRoles.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.roleName || item.roleId?.name}</td>
                    <td>{item.member?.fullName || item.memberId?.fullName}</td>
                    {/* <td>
                      <span
                        className={`badge ${item.isActive === 1
                          ? "bg-success-50 text-success-600"
                          : "bg-danger-50 text-danger-600"
                          } px-12 py-4 radius-4`}
                      >
                        {item.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td> */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                        >
                          <Icon icon="lucide:edit" className="menu-icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="bg-danger-focus text-danger-600 bg-hover-danger-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                        >
                          <Icon icon="lucide:trash-2" className="menu-icon" />
                        </button>
                        {/* <button
                          onClick={() => handleStatusToggleClick(item)}
                          className={`remove-item-btn ${item.isActive === 1 ? 'bg-danger-focus bg-hover-danger-200 text-danger-600' : 'bg-success-focus bg-hover-success-200 text-success-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                        >
                          <Icon icon={item.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No roles assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${roleToToggle?.isActive === 1 ? "bg-danger-focus" : "bg-success-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={roleToToggle?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${roleToToggle?.isActive === 1 ? "text-danger-600" : "text-success-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {roleToToggle?.isActive === 1 ? "inactive" : "active"} this role assignment?
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
              variant={roleToToggle?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleStatusUpdate}
              style={roleToToggle?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {roleToToggle?.isActive === 1 ? "Inactive" : "Active"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showConfirmDeleteModal} onHide={handleCloseConfirmDeleteModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="bg-danger-focus rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px">
              <Icon
                icon="lucide:trash-2"
                className="text-danger-600 text-xxl"
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to permanently delete this role assignment?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseConfirmDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="px-32"
              onClick={handleDelete}
              style={{ backgroundColor: "#003366", borderColor: "#003366" }}
            >
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChapterRoleAssignLayer;
