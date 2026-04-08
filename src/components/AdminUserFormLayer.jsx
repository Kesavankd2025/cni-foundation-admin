import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminUserApi from "../Api/AdminUserApi";
import RoleApi from "../Api/RoleApi";
import usePermissions from "../hook/usePermissions";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { formatErrorMessage } from "../helper/TextHelper";
import { IMAGE_BASE_URL } from "../Config/Index";
import ImageUploadApi from "../Api/ImageUploadApi";

const AdminUserFormLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    pin: "",
    companyName: "",
    roleId: "",
    isActive: 1,
  });

  const [profileImage, setProfileImage] = useState(null); // Selected file
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [imagePath, setImagePath] = useState(""); // Path from server
  const [savedImage, setSavedImage] = useState(null); // Initial image path
  const [isUploading, setIsUploading] = useState(false);

  const [roleOptions, setRoleOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // Enhanced PIN state management
  const [pinState, setPinState] = useState({
    isDirty: !isEdit, // true for create mode, false for edit mode initially
    isEditing: false, // true when user is actively focused on PIN fields
    hasValue: false, // true when 4 digits are entered
  });

  useEffect(() => {
    fetchRoles();
    if (isEdit) {
      getAdminUserById(id);
    }
  }, [isEdit, id]);

  const fetchRoles = async () => {
    const response = await RoleApi.getRoles({
      search: "",
      roleType: "adminRoles",
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
        pin: "", // Never populate PIN from backend for security
        companyName: data.companyName || "",
        roleId: data.roleId?._id || data.roleId || "",
        isActive: data.isActive !== undefined ? data.isActive : 1,
      });

      if (data.profileImage) {
        const imageObj = data.profileImage;

        setSavedImage(imageObj);        // store full object
        setImagePath(imageObj.path);    // for preview only
        setProfileImagePreview(`${IMAGE_BASE_URL}/${imageObj.path}`);
      }

      // Reset PIN state for edit mode
      setPinState({
        isDirty: false,
        isEditing: false,
        hasValue: false,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pin") {
      // Only allow numbers and max 4 digits
      const cleanedValue = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
      setPinState((prev) => ({
        ...prev,
        hasValue: cleanedValue.length === 4,
      }));
    } else if (name === "name") {
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

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.value === "Active" ? 1 : 0,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
      // Optional: Clear any error related to image if existed
    }
  };

  const removeImage = async () => {
    if (profileImage) {
      // Just clearing the selected file
      setProfileImage(null);
      if (savedImage && savedImage.path) {
        setProfileImagePreview(`${IMAGE_BASE_URL}/${savedImage.path}`);
        setImagePath(savedImage.path);
      } else {
        setProfileImagePreview(null);
        setImagePath("");
      }
    } else if (imagePath) {
      // Removing the saved image - just updates UI
      setImagePath("");
      // setSavedImage(null); // Keep savedImage to know what to delete on submit
      setProfileImagePreview(null);
    }
  };

  // Enhanced PIN handlers
  const handlePinFocus = (index) => {
    setPinState((prev) => ({ ...prev, isEditing: true }));
  };

  const handlePinChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);

    // Only mark as dirty if the user actually enters a character
    setPinState((prev) => ({ ...prev, isDirty: true, isEditing: true }));

    const currentPin = formData.pin || "";
    let newPinArray = currentPin.split("");
    while (newPinArray.length < 4) newPinArray.push("");

    newPinArray[index] = char;
    const finalPin = newPinArray.join("").slice(0, 4);

    setFormData((prev) => ({ ...prev, pin: finalPin }));
    setPinState((prev) => ({
      ...prev,
      hasValue: finalPin.length === 4,
    }));

    // Auto-focus next field
    if (char && index < 3) {
      setTimeout(() => {
        const next = document.getElementById(`pin-input-${index + 1}`);
        if (next) next.focus();
      }, 10);
    }
  };

  const handlePinBlur = () => {
    // If user blurred without entering any digits, reset dirty state to show masks again
    if (!formData.pin || formData.pin.length === 0) {
      setPinState((prev) => ({ ...prev, isDirty: false, isEditing: false }));
    } else {
      setPinState((prev) => ({ ...prev, isEditing: false }));
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      // If backspacing while masked, clear mask and start fresh
      if (!pinState.isDirty && isEdit) {
        setPinState((prev) => ({
          ...prev,
          isDirty: true,
          isEditing: true,
        }));
        setFormData((prev) => ({ ...prev, pin: "" }));
        return;
      }

      const currentValue = (formData.pin || "")[index];
      if (!currentValue && index > 0) {
        // Move to previous field if current is empty
        e.preventDefault();
        const prev = document.getElementById(`pin-input-${index - 1}`);
        if (prev) prev.focus();
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = formatErrorMessage("name is required");
    if (!formData.phoneNumber)
      newErrors.phoneNumber = formatErrorMessage("phone number is required");
    if (!formData.email) {
      newErrors.email = formatErrorMessage("email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = formatErrorMessage("Invalid Email Format");
    }
    if (!formData.companyName)
      newErrors.companyName = formatErrorMessage("company name is required");
    if (!formData.roleId)
      newErrors.roleId = formatErrorMessage("role is required");

    // Enhanced PIN validation
    if (!isEdit) {
      // Create mode: PIN is always required
      if (!formData.pin || formData.pin.length !== 4) {
        newErrors.pin = formatErrorMessage("PIN is Required");
      }
    } else {
      // Edit mode: PIN is optional.
      // We only validate if the user has actually typed something (isDirty)
      // AND they haven't cleared it out completely.
      if (pinState.isDirty && formData.pin && formData.pin.length > 0) {
        if (formData.pin.length !== 4) {
          newErrors.pin = formatErrorMessage("PIN must be exactly 4 digits");
        }
      }
    }

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

      let finalImageData = savedImage;

      // If existing image was removed in UI
      if (imagePath === "") {
        finalImageData = {
          path: "",
          fileName: "",
          originalName: "",
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
            finalImageData = res.response.data;
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
      if (
        savedImage &&
        savedImage.path &&
        (!finalImageData || finalImageData.path !== savedImage.path)
      ) {
        await ImageUploadApi.deleteImage({ path: savedImage.path });
      }


      const payload = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        companyName: formData.companyName,
        roleId: formData.roleId,
        isActive: formData.isActive,
        profileImage: finalImageData,
      };

      if (isEdit) {
        payload.id = id;
      }

      // PIN logic
      if (isEdit) {
        if (pinState.isDirty && formData.pin && formData.pin.length === 4) {
          payload.pin = formData.pin;
        }
      } else {
        payload.pin = formData.pin;
      }

      let response;
      if (isEdit) {
        response = await AdminUserApi.updateAdminUser(payload);
      } else {
        response = await AdminUserApi.createAdminUser(payload);
      }

      if (response && response.status) {
        navigate("/admin-registration");
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
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEdit ? "Edit Admin User" : "Create Admin User"}
        </h6>
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
                      className="w-100 h-100 object-fit-cover"
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
                      Phone Number <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter Phone Number"
                      maxLength={10}
                    />
                    {errors.phoneNumber && (
                      <small className="text-danger">{errors.phoneNumber}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Full Width */}
            <div className="col-12 mt-4">
              <div className="row gy-3">
                <div
                  className="col-lg-4"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label fw-semibold" id="pin-label">
                      PIN - 4 Digits{" "}
                      {!isEdit && <span className="text-danger-600">*</span>}
                    </label>
                    <div
                      className="d-flex gap-2"
                      role="group"
                      aria-labelledby="pin-label"
                      aria-describedby="pin-hint"
                    >
                      {[0, 1, 2, 3].map((index) => {
                        const showMask =
                          !pinState.isDirty && !pinState.isEditing && isEdit;
                        const displayValue = showMask
                          ? "•"
                          : (formData.pin || "")[index] || "";

                        return (
                          <input
                            key={index}
                            id={`pin-input-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            className={`form-control text-center text-md fw-semibold p-0 radius-8 ${errors.pin ? "border-danger" : ""
                              }`}
                            style={{
                              width: "50px",
                              height: "45px",
                              fontSize:
                                !pinState.isDirty && isEdit ? "1.2rem" : "1rem",
                            }}
                            value={displayValue}
                            onFocus={() => handlePinFocus(index)}
                            onChange={(e) =>
                              handlePinChange(index, e.target.value)
                            }
                            onBlur={handlePinBlur}
                            onKeyDown={(e) => handlePinKeyDown(index, e)}
                            maxLength={1}
                            autoComplete="new-password"
                            aria-label={`PIN digit ${index + 1}`}
                            aria-required={!isEdit}
                            aria-invalid={!!errors.pin}
                          />
                        );
                      })}
                    </div>
                    {errors.pin && (
                      <small className="text-danger d-block mt-1" role="alert">
                        {errors.pin}
                      </small>
                    )}
                  </div>
                </div>

                <div className="col-lg-4" style={{ position: "relative", right: '9%' }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Role <span className="text-danger-600">*</span>
                    </label>
                    <Select
                      options={roleOptions}
                      value={roleOptions.find(
                        (opt) => opt.value === formData.roleId,
                      )}
                      onChange={handleSelectChange}
                      styles={selectStyles(!!errors.roleId)}
                      placeholder="Select Role"
                    />
                    {errors.roleId && (
                      <small className="text-danger">{errors.roleId}</small>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold mb-8">Status</label>
                    <div className="d-flex align-items-center gap-4 mt-2">
                      {/* Active Status */}
                      <div
                        className="d-flex align-items-center gap-10 cursor-pointer pe-20"
                        onClick={() => setFormData((prev) => ({ ...prev, isActive: 1 }))}
                      >
                        <div
                          className={`w-36-px h-36-px d-flex align-items-center justify-content-center radius-10 transition-all ${formData.isActive === 1
                            ? "bg-danger-100 border border-danger-200"
                            : "bg-neutral-100 border border-neutral-200"
                            }`}
                        >
                          <div
                            className={`w-24-px h-24-px d-flex align-items-center justify-content-center radius-6 transition-all ${formData.isActive === 1
                              ? "bg-danger-600 shadow-sm"
                              : "bg-white border border-neutral-300"
                              }`}
                          >
                            {formData.isActive === 1 && (
                              <Icon
                                icon="fa6-solid:check"
                                className="text-white fontsize-12"
                              />
                            )}
                          </div>
                        </div>
                        <span
                          className={`fontsize-13 fw-bold transition-all ${formData.isActive === 1
                            ? "text-primary-light"
                            : "text-secondary-light"
                            }`}
                        >
                          Active
                        </span>
                      </div>

                      {/* Inactive Status */}
                      <div
                        className="d-flex align-items-center gap-10 cursor-pointer pe-20"
                        onClick={() => setFormData((prev) => ({ ...prev, isActive: 0 }))}
                      >
                        <div
                          className={`w-36-px h-36-px d-flex align-items-center justify-content-center radius-10 transition-all ${formData.isActive === 0
                            ? "bg-danger-100 border border-danger-200"
                            : "bg-neutral-100 border border-neutral-200"
                            }`}
                        >
                          <div
                            className={`w-24-px h-24-px d-flex align-items-center justify-content-center radius-6 transition-all ${formData.isActive === 0
                              ? "bg-danger-600 shadow-sm"
                              : "bg-white border border-neutral-300"
                              }`}
                          >
                            {formData.isActive === 0 && (
                              <Icon
                                icon="fa6-solid:check"
                                className="text-white fontsize-12"
                              />
                            )}
                          </div>
                        </div>
                        <span
                          className={`fontsize-13 fw-bold transition-all ${formData.isActive === 0
                            ? "text-primary-light"
                            : "text-secondary-light"
                            }`}
                        >
                          Inactive
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-3 mt-4 pt-3">
              <Link
                to="/admin-registration"
                className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
                style={{ width: "130px" }}
              >
                Cancel
              </Link>
              {hasPermission("Admin Registration", isEdit ? "edit" : "add") && (
                <button
                  type="submit"
                  className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                  disabled={loading}
                  style={{ width: "130px" }}
                >
                  {loading ? "Saving..." : isEdit ? "Update" : "Save"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserFormLayer;
