import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";
import LeadershipTeamApi from "../Api/LeadershipTeamApi";
import LeadershipRoleApi from "../Api/LeadershipRoleApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const LeadershipTeamFormLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: "",
        roleId: "",
        about: "",
        status: "Active"
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state for quick role creation
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [roleLoading, setRoleLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const roleRes = await LeadershipRoleApi.getAllRoles();
            if (roleRes.status) {
                const data = roleRes.response.data || roleRes.response;
                setRoles(data);
            }

            if (isEdit) {
                const memberRes = await LeadershipTeamApi.getMemberById(id);
                if (memberRes.status && memberRes.response.data) {
                    const data = memberRes.response.data;
                    setFormData({
                        name: data.name || "",
                        roleId: data.roleId || "",
                        about: data.about || "",
                        status: data.status || "Active"
                    });
                    if (data.image) {
                        setExistingImage(data.image);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRoleSelectChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, roleId: selectedOption ? selectedOption.value : "" }));
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        setRoleLoading(true);
        try {
            const res = await LeadershipRoleApi.createRole({ name: newRoleName });
            if (res.status) {
                const createdRole = res.response.data;
                setRoles(prev => [createdRole, ...prev]);
                setFormData(prev => ({ ...prev, roleId: createdRole._id }));
                setShowRoleModal(false);
                setNewRoleName("");
            }
        } catch (error) {
            console.error("Error creating role", error);
        } finally {
            setRoleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let memberImageData = existingImage;

            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);
                const uploadRes = await ImageUploadApi.uploadImage({
                    formData: uploadFormData,
                    path: "leadership",
                });

                if (uploadRes.status) {
                    memberImageData = uploadRes.response.data;
                } else {
                    alert("Image upload failed");
                    setLoading(false);
                    return;
                }
            }

            const payload = {
                ...formData,
                image: memberImageData,
            };

            let response;
            if (isEdit) {
                response = await LeadershipTeamApi.updateMember(id, payload);
            } else {
                response = await LeadershipTeamApi.createMember(payload);
            }

            if (response && response.status) {
                navigate("/leadership-team-list");
            } else {
                alert(response?.response?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving member", error);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = roles.map(role => ({
        value: role._id,
        label: role.name
    }));

    const selectedRoleOption = roleOptions.find(opt => opt.value === formData.roleId);

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-primary-600 pb-2 mb-0">
                    {isEdit ? "Edit" : "Create"} Leadership Team
                </h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-4">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Name <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control radius-8" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Name" required />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Role <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex gap-2">
                                <div className="flex-grow-1">
                                    <Select
                                        className="radius-8"
                                        options={roleOptions}
                                        value={selectedRoleOption}
                                        onChange={handleRoleSelectChange}
                                        placeholder="Select Role"
                                        isClearable
                                        noOptionsMessage={() => (
                                            <div className="d-flex justify-content-between align-items-center cursor-pointer px-2 py-1" onClick={() => setShowRoleModal(true)}>
                                                <span>No role found</span>
                                                <Button size="sm" variant="outline-primary"><Icon icon="ic:baseline-plus" /></Button>
                                            </div>
                                        )}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary radius-8 d-flex align-items-center justify-content-center p-0 w-40-px h-40-px"
                                    onClick={() => setShowRoleModal(true)}
                                    title="Add New Role"
                                >
                                    <Icon icon="ic:baseline-plus" className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                About / Bio
                            </label>
                            <textarea
                                className="form-control radius-8"
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                placeholder="Write something about the member..."
                                rows="4"
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Profile Image</label>
                            <input
                                type="file"
                                className="form-control radius-8"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imagePreview ? (
                                <div className="mt-8">
                                    <img src={imagePreview} alt="Preview" className="w-120-px h-120-px object-fit-cover radius-8 border" />
                                </div>
                            ) : existingImage && existingImage.path && (
                                <div className="mt-8">
                                    <img src={`${IMAGE_BASE_URL}/${existingImage.path}`} alt="Current" className="w-120-px h-120-px object-fit-cover radius-8 border" />
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Status
                            </label>
                            <select
                                className="form-select radius-8"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-24">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-outline-danger-600 px-32 radius-8"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary radius-8 px-20 py-11"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : isEdit ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Quick Role Creation Modal */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-primary-600 text-md">Add New Leadership Role</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-24">
                    <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Role Name</label>
                        <input
                            type="text"
                            className="form-control radius-8"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="Enter role name"
                            autoFocus
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 p-24 pt-0">
                    <Button variant="outline-danger" onClick={() => setShowRoleModal(false)} disabled={roleLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateRole} disabled={roleLoading || !newRoleName.trim()}>
                        {roleLoading ? "Creating..." : "Create Role"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LeadershipTeamFormLayer;
