import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import MemberApi from "../Api/MemberApi";
import VerticalDirectorApi from "../Api/VerticalDirectorApi";
import { selectStyles } from "../helper/SelectStyles";
import { Modal, Button } from "react-bootstrap";
import { IMAGE_BASE_URL } from "../Config/Index";

const VerticalDirectorAssignLayer = () => {
    const [roleOptions, setRoleOptions] = useState([]);
    const [memberOptions, setMemberOptions] = useState([]);
    const [assignedDirectors, setAssignedDirectors] = useState([]);
    const [formData, setFormData] = useState({
        role: null,
        member: null,
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [directorToDelete, setDirectorToDelete] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchRoles();
        fetchMembers();
        fetchDirectorsList();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await VerticalDirectorApi.getRoles();
            if (res.status && res.response.data) {
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
            const res = await MemberApi.getMembers();
            if (res.status) {
                const data = res.response.data?.docs || res.response.data || [];
                setMemberOptions(
                    data.map((m) => ({
                        value: m._id,
                        label: `${m.fullName} - ${m.phoneNumber}`,
                    })),
                );
            }
        } catch (error) {
            console.error("Error fetching members", error);
        }
    };

    const fetchDirectorsList = async () => {
        try {
            const res = await VerticalDirectorApi.getDirectorsList();
            if (res.status) {
                setAssignedDirectors(res.response.data || []);
            }
        } catch (error) {
            console.error("Error fetching directors list", error);
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
                const res = await VerticalDirectorApi.updateDirector(editId, payload);
                if (res.status) {
                    fetchDirectorsList();
                    setFormData({ role: null, member: null });
                    setIsEditMode(false);
                    setEditId(null);
                }
            } else {
                const payload = {
                    roleId: formData.role.value,
                    memberId: formData.member.value,
                };
                const res = await VerticalDirectorApi.assignDirector(payload);
                if (res.status) {
                    fetchDirectorsList();
                    setFormData({ role: null, member: null });
                }
            }
        } catch (error) {
            console.error("Error submitting director assignment", error);
        }
    };

    const handleEdit = (item) => {
        const memberData = item.member || item.memberId;
        setFormData({
            role: {
                value: item.roleId?._id || item.roleId,
                label: item.roleName || item.roleId?.name,
            },
            member: {
                value: memberData?._id,
                label: memberData?.fullName || "Select Member",
            },
        });
        setIsEditMode(true);
        setEditId(item._id);
    };

    const handleDeleteClick = (item) => {
        setDirectorToDelete(item);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (directorToDelete) {
            try {
                const res = await VerticalDirectorApi.deleteDirector(directorToDelete._id);
                if (res.status) {
                    fetchDirectorsList();
                    setShowDeleteModal(false);
                    setDirectorToDelete(null);
                }
            } catch (error) {
                console.error("Error deleting director", error);
            }
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDirectorToDelete(null);
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                    <h6 className="text-primary-600 mb-0">Vertical Directors</h6>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Link
                        to="/vertical-directors/history"
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 radius-8"
                    >
                        <Icon icon="solar:history-bold" className="text-xl" />
                        History
                    </Link>
                </div>
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit} className="mb-24">
                    <div className="row gy-3">
                        <div className="col-md-5">
                            <label className="form-label fw-semibold">Vertical Director Roles</label>
                            <Select
                                name="role"
                                options={roleOptions}
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="Select Role"
                                isDisabled={isEditMode}
                                styles={selectStyles(errors.role)}
                            />
                            {errors.role && (
                                <small className="text-danger">{errors.role}</small>
                            )}
                        </div>
                        <div className="col-md-5">
                            <label className="form-label fw-semibold">Member List</label>
                            <Select
                                name="member"
                                options={memberOptions}
                                value={formData.member}
                                onChange={handleChange}
                                placeholder="Select Member"
                                styles={selectStyles(errors.member)}
                            />
                            {errors.member && (
                                <small className="text-danger">{errors.member}</small>
                            )}
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
                                <th scope="col" style={{ color: "black" }}>S.No</th>
                                <th scope="col" style={{ color: "black" }}>Role</th>
                                <th scope="col" style={{ color: "black" }}>Member</th>
                                <th scope="col" style={{ color: "black" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedDirectors.length > 0 ? (
                                assignedDirectors.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{item.roleName || item.roleId?.name}</td>
                                        <td>
                                            {item.member ? (
                                                <div className="d-flex align-items-center">
                                                    {item.member.profileImage?.path || (typeof item.member.profileImage === "string" && item.member.profileImage) ? (
                                                        <img
                                                            src={
                                                                item.member.profileImage?.path
                                                                    ? `${IMAGE_BASE_URL}/${item.member.profileImage.path}`
                                                                    : `${IMAGE_BASE_URL}/${item.member.profileImage}`
                                                            }
                                                            alt=""
                                                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                                                            onError={(e) => {
                                                                const name = item.member.fullName || "M";
                                                                const initial = name.charAt(0).toUpperCase();
                                                                e.target.outerHTML = `<div class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg"
                                                        >
                                                            {item.member.fullName?.charAt(0).toUpperCase() || "M"}
                                                        </div>
                                                    )}
                                                    <div className="flex-grow-1">
                                                        <span className="text-md mb-0 fw-normal text-secondary-light d-block">
                                                            {item.member.fullName || "Unknown"}
                                                        </span>
                                                        <span className="text-xs text-secondary-light fw-normal">
                                                            {item.member.companyName || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                item.memberId?.fullName || "N/A"
                                            )}
                                        </td>
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
                                                    className="remove-item-btn bg-danger-focus text-danger-600 bg-hover-danger-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                                                >
                                                    <Icon icon="lucide:trash-2" className="menu-icon" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">No directors assigned.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
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
                        Do you want to permanently delete this director assignment?
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="outline-secondary" className="px-32" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            className="px-32"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default VerticalDirectorAssignLayer;
