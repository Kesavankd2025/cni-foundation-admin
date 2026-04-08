import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminUserApi from "../Api/AdminUserApi";
import RoleApi from "../Api/RoleApi";
import usePermissions from "../hook/usePermissions";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { formatErrorMessage } from "../helper/TextHelper";
import { IMAGE_BASE_URL } from "../Config/Index";
import ImageUploadApi from "../Api/ImageUploadApi";

const MyProfileLayer = () => {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    // Get logged in user from localStorage
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setCurrentUser(parsedUser);
        }
    }, []);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        email: "",
        companyName: "",
        roleId: "",
        roleName: "",
        isActive: 1,
    });

    const [profileImage, setProfileImage] = useState(null); // Selected file
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [imagePath, setImagePath] = useState(""); // Path from server
    const [savedImage, setSavedImage] = useState(null); // Initial image path
    const [isUploading, setIsUploading] = useState(false);

    const [roleOptions, setRoleOptions] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchRoles();
        if (currentUser?._id) {
            getAdminUserById(currentUser._id);
        }
    }, [currentUser]);

    const fetchRoles = async () => {
        const response = await RoleApi.getRoles({
            search: "",
            showForAdmin: "",
        });
        if (response && response.status && response.response.data) {
            const roles = response.response.data.map((role) => ({
                value: role._id,
                label: role.name,
            }));
            setRoleOptions(roles);
        }
    };

    const getAdminUserById = async (id) => {
        const response = await AdminUserApi.getAdminUser(id);
        if (response && response.status && response.response.data) {
            const data = response.response.data;
            setFormData({
                name: data.name || "",
                phoneNumber: data.phoneNumber || "",
                email: data.email || "",
                companyName: data.companyName || "",
                roleId: data.roleId?._id || data.roleId || "",
                roleName: data.roleId?.name || "",
                isActive: data.isActive !== undefined ? data.isActive : 1,
            });

            if (data.profileImage) {
                const imagePath = data.profileImage?.path || data.profileImage;
                setSavedImage(imagePath);
                setImagePath(imagePath);
                setProfileImagePreview(`${IMAGE_BASE_URL}/${imagePath}`);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "name") {
            // Allow only alphabets and spaces (no numbers)
            if (/[0-9]/.test(value)) return;
            setFormData((prev) => ({ ...prev, [name]: value }));
        } else if (name === "phoneNumber") {
            // Allow only numbers and max 10 digits
            const cleaned = value.replace(/\D/g, "").slice(0, 10);
            setFormData((prev) => ({ ...prev, [name]: cleaned }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (selectedOption) => {
        setFormData((prev) => ({ ...prev, roleId: selectedOption?.value || "" }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = async () => {
        if (profileImage) {
            // Just clearing the selected file
            setProfileImage(null);
            if (savedImage) {
                setProfileImagePreview(`${IMAGE_BASE_URL}/${savedImage}`);
                setImagePath(savedImage);
            } else {
                setProfileImagePreview(null);
                setImagePath("");
            }
        } else if (imagePath) {
            // Removing the saved image - just updates UI
            setImagePath("");
            setProfileImagePreview(null);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = formatErrorMessage("name is required");

        if (!formData.email) {
            newErrors.email = formatErrorMessage("email is required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = formatErrorMessage("Invalid Email Format");
        }
        if (!formData.companyName)
            newErrors.companyName = formatErrorMessage("company name is required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        setIsUploading(true);

        try {
            let finalImagePath = savedImage;
            if (imagePath === "") {
                finalImagePath = {
                    path: "",
                    originalName: "",
                    fileName: "",
                };
            }

            // Upload Image if selected
            if (profileImage) {
                const formDataUpload = new FormData();
                formDataUpload.append("file", profileImage);
                const uploadData = {
                    formData: formDataUpload,
                    path: "admin-profile",
                };
                try {
                    const res = await ImageUploadApi.uploadImage(uploadData);
                    if (res.status) {
                        finalImagePath = res.response.data;
                    } else {
                        setLoading(false);
                        setIsUploading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Image upload failed", error);
                    setLoading(false);
                    setIsUploading(false);
                    return;
                }
            }

            // Check for deletion of old image
            if (savedImage && finalImagePath !== savedImage) {
                await ImageUploadApi.deleteImage({ path: savedImage });
            }

            const payload = {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                companyName: formData.companyName,
                roleId: formData.roleId,
                isActive: formData.isActive,
                profileImage: finalImagePath,
            };

            if (currentUser?._id) {
                payload.id = currentUser._id;
            }

            const response = await AdminUserApi.updateAdminUser(payload);
            if (response && response.status) {
                // Optional: Show success message or navigate
            }
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
            setIsUploading(false);
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header bg-transparent border-bottom px-24 py-16">
                <h6 className="text-primary-600 pb-2 mb-0">My Profile</h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="row gy-3">
                        <h6 className="text-primary-600 mb-2">Basic Information</h6>

                        {/* Image Upload - Left Side */}
                        <div className="col-lg-2">
                            <div className="d-flex flex-column align-items-center" style={{ gap: "20px" }}>
                                <div
                                    className="upload-image-wrapper d-flex align-items-center justify-content-center bg-base radius-8 overflow-hidden position-relative border border-neutral-200"
                                    style={{ width: "120px", height: "120px" }}
                                >
                                    {profileImagePreview ? (
                                        <img
                                            src={profileImagePreview}
                                            alt="Profile"

                                            onError={() => {
                                                setProfileImagePreview(null);
                                                setImagePath("");
                                            }}
                                        />
                                    ) : (
                                        <Icon
                                            icon="solar:user-bold"
                                            className="text-neutral-400 text-5xl"
                                        />
                                    )}
                                </div>

                                <div className="d-flex justify-content-center gap-2">
                                    <label className="btn btn-outline-primary btn-sm radius-8 px-20 mb-0 cursor-pointer">
                                        Choose
                                        <input
                                            type="file"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    {profileImagePreview && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm radius-8"
                                            onClick={removeImage}
                                        >
                                            <Icon icon="mingcute:delete-2-line" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Fields - Right Side */}
                        <div className="col-lg-10">
                            <div className="row gy-3">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Name <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control radius-8"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter Full Name"
                                        />
                                        {errors.name && (
                                            <small className="text-danger">{errors.name}</small>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Email <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control radius-8"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter Email Address"
                                        />
                                        {errors.email && (
                                            <small className="text-danger">{errors.email}</small>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Company Name <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control radius-8"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Enter Company Name"
                                        />
                                        {errors.companyName && (
                                            <small className="text-danger">{errors.companyName}</small>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control radius-8"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Enter Phone Number"
                                            maxLength={10}
                                            disabled
                                        />
                                    </div>
                                </div>

                                {/* Role Field - Now a disabled input */}
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control radius-8"
                                            value={formData.roleName}
                                            disabled
                                            placeholder="User Role"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="col-12 d-flex justify-content-end gap-3 mt-4 pt-3">
                            <Link
                                to="/"
                                className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
                                style={{ width: "130px" }}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                                disabled={loading}
                                style={{ width: "130px" }}
                            >
                                {loading ? "Saving..." : "Update"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfileLayer;