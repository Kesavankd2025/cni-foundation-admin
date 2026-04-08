import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import usePermissions from "../hook/usePermissions";
import { Icon } from "@iconify/react/dist/iconify.js";
import ChiefGuestApi from "../Api/ChiefGuestApi";
import BusinessCategoryApi from "../Api/BusinessCategoryApi";
import MemberApi from "../Api/MemberApi";
import ReportApi from "../Api/ReportApi";
import { Spinner } from "react-bootstrap";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { formatErrorMessage } from "../helper/TextHelper";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const ChiefGuestFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [savedImage, setSavedImage] = useState(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null); // stores the image object to delete on submit
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    chiefGuestName: "",
    contactNumber: "",
    emailId: "",
    businessName: "",
    businessCategory: "",
    about: "",
    location: "",
    referredBy: "",
    address: "",
  });
  const [businessCategories, setBusinessCategories] = useState([]);
  const [members, setMembers] = useState([]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.chiefGuestName)
      newErrors.chiefGuestName = formatErrorMessage(
        "chief guest name is required",
      );
    if (!formData.contactNumber)
      newErrors.contactNumber = formatErrorMessage(
        "contact number is required",
      );
    if (!formData.emailId) {
      newErrors.emailId = formatErrorMessage("email id is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = formatErrorMessage("Invalid Email Format (e.g., User@example.com)");
    }
    if (!formData.businessName)
      newErrors.businessName = formatErrorMessage("business name is required");
    if (!formData.businessCategory)
      newErrors.businessCategory = formatErrorMessage(
        "business category is required",
      );
    if (!formData.referredBy)
      newErrors.referredBy = formatErrorMessage("referred by is required");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const promises = [
          BusinessCategoryApi.getBusinessCategory(null, 0, 500, ""),
          MemberApi.getMembers({ limit: 1000 }),
        ];

        if (isEditMode) {
          promises.push(ChiefGuestApi.getChiefGuestDetails(id));
        }

        const [catRes, memRes, guestRes] = await Promise.all(promises);

        let categoriesList = [];
        if (catRes && catRes.status) {
          const data =
            catRes.response?.data?.data ||
            catRes.response?.data ||
            catRes.response ||
            [];
          categoriesList = Array.isArray(data) ? data : [];
          setBusinessCategories(categoriesList);
        }

        let membersList = [];
        if (memRes && memRes.status) {
          const data =
            memRes.response?.data?.members ||
            memRes.response?.data?.data ||
            memRes.response?.data ||
            memRes.response ||
            [];
          membersList = Array.isArray(data) ? data : [];
          setMembers(membersList);
        }

        if (isEditMode && guestRes && guestRes.status) {
          const guest = guestRes.data.data || guestRes.data;

          // Image handling
          if (guest.profileImage) {
            let imageObj;

            if (typeof guest.profileImage === "string") {
              const path = guest.profileImage;
              const fileName = path.split("/").pop();

              imageObj = {
                fileName: fileName,
                originalName: fileName,
                path: path,
              };
            } else {
              imageObj = guest.profileImage; // already full object
            }

            setSavedImage(imageObj);          // ✅ full object
            setImagePath(imageObj.path);
            setPreview(imageObj.path ? `${IMAGE_BASE_URL}/${imageObj.path}` : null);
          }

          // Fallback: If fields are missing (backend issue), try to fetch from List API
          if (!guest.businessCategory || !guest.referredBy) {
            try {
              const listRes = await ChiefGuestApi.getChiefGuests(
                1,
                100,
                guest.chiefGuestName,
              );
              let found = null;
              if (listRes.status && listRes.data) {
                const listData =
                  listRes.data.data || listRes.data.docs || listRes.data || [];
                if (Array.isArray(listData)) {
                  found = listData.find((g) => g._id === guest._id);
                }
              }

              if (found) {
                // Handle Business Category
                if (!guest.businessCategory && found.businessCategory) {
                  if (
                    typeof found.businessCategory === "object" &&
                    found.businessCategory._id
                  ) {
                    guest.businessCategory = found.businessCategory._id;
                  } else {
                    // String match
                    const match = categoriesList.find(
                      (c) =>
                        (c.name || "").trim().toLowerCase() ===
                        (found.businessCategory || "").trim().toLowerCase(),
                    );
                    if (match) guest.businessCategory = match._id;
                  }
                }

                // Handle Referred By
                if (!guest.referredBy && found.referredBy) {
                  if (
                    typeof found.referredBy === "object" &&
                    found.referredBy._id
                  ) {
                    guest.referredBy = found.referredBy._id;
                  } else {
                    // String match
                    const match = membersList.find(
                      (m) =>
                        (m.fullName || m.name || "").trim().toLowerCase() ===
                        (found.referredBy || "").trim().toLowerCase(),
                    );
                    if (match) guest.referredBy = match._id;
                  }
                }
              }
            } catch (ignore) {
              console.warn("Fallback fetch failed", ignore);
            }
          }

          // Note: profileImage is managed separately via savedImage state, not in formData
          setFormData({
            profileImage: guest.profileImage?.path || guest.profileImage || "",
            chiefGuestName: guest.chiefGuestName || "",
            contactNumber: guest.contactNumber || "",
            emailId: guest.emailId || "",
            businessName: guest.businessName || "",
            businessCategory:
              guest.businessCategory?._id ||
              guest.businessCategory?.id ||
              (typeof guest.businessCategory === "string"
                ? guest.businessCategory
                : ""),
            about: guest.about || "",
            location: guest.location || "",
            referredBy:
              guest.referredBy?._id ||
              guest.referredBy?.id ||
              (typeof guest.referredBy === "string" ? guest.referredBy : ""),
            address: guest.address || "",
          });
        }
      } catch (error) {
        console.error("Error initializing field options:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [isEditMode, id]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "contactNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "chiefGuestName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (selectedOption, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      if (errors.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: "" }));
      }
    }
  };

  const handleDeleteImage = () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (imagePath) {
        setPreview(`${IMAGE_BASE_URL}/${imagePath}`);
      } else {
        setPreview(null);
      }
      return;
    }

    if (imagePath) {
      setImageToDelete(savedImage); // Mark the server image for deletion
      setImagePath("");
      setPreview(null);
    }
  };

  const categoryOptions = useMemo(
    () =>
      businessCategories.map((cat) => ({
        value: cat._id,
        label: cat.name,
      })),
    [businessCategories],
  );

  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        value: member._id,
        label: member.fullName || member.name,
      })),
    [members],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        let finalImage = savedImage;
        if (imagePath === "") {
          finalImage = {
            path: "",
            fileName: "",
            originalName: "",
          };
        }

        // Upload new image
        if (selectedFile) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", selectedFile);

          try {
            const res = await ImageUploadApi.uploadImage({
              formData: formDataUpload,
              path: "chief-guest-profile",
            });

            if (res.status) {
              finalImage = res.response.data; // full object
            } else {
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Image upload failed", error);
            setLoading(false);
            return;
          }
        }

        // Delete image ONLY if it was explicitly marked for deletion via the delete icon
        if (imageToDelete && imageToDelete.path) {
          try {
            await ImageUploadApi.deleteImage({ path: imageToDelete.path });
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }

        const payload = {
          ...formData,
          profileImage: finalImage,
        };

        let response;
        if (isEditMode) {
          response = await ChiefGuestApi.updateChiefGuest(id, payload);
        } else {
          response = await ChiefGuestApi.createChiefGuest(payload);
        }

        if (response.status) {
          navigate("/chief-guest-list");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center py-50">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Chief Guest" : "Create Chief Guest"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            {/* Profile Image - Left side */}
            <div className="col-md-4 d-flex align-items-center justify-content-center mb-4">
              <div className="text-center">
                <div
                  className="rounded-12 overflow-hidden position-relative mx-auto mb-16 border border-neutral-200"
                  style={{
                    width: "160px",
                    height: "160px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {preview || imagePath ? (
                    <img
                      src={preview || imagePath}
                      alt="Profile"
                      className="w-100 h-100 object-fit-cover"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/160x160?text=Error";
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-secondary-light">
                      <Icon
                        icon="solar:user-bold"
                        className="text-7xl opacity-25"
                        style={{ fontSize: "4rem" }}
                      />
                    </div>
                  )}
                  {isUploading && (
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                      style={{ zIndex: 2 }}
                    >
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <label
                    className="btn btn-outline-primary btn-sm radius-8 px-20"
                    htmlFor="profileImageUpload"
                  >
                    Choose Profile
                  </label>
                  {(preview || imagePath) && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm radius-8"
                      onClick={handleDeleteImage}
                    >
                      <Icon icon="mingcute:delete-2-line" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  id="profileImageUpload"
                  hidden
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
            </div>

            {/* Right Side - 4 fields */}
            <div className="col-md-8">
              <div className="row gy-3">
                {/* Chief Guest Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Chief Guest Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control radius-8"
                    name="chiefGuestName"
                    value={formData.chiefGuestName}
                    onChange={handleChange}
                    placeholder="Enter Chief Guest Name"
                  />
                  {errors.chiefGuestName && (
                    <small className="text-danger">{errors.chiefGuestName}</small>
                  )}
                </div>

                {/* Phone Number */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control radius-8"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter Phone Number"
                  />
                  {errors.contactNumber && (
                    <small className="text-danger">{errors.contactNumber}</small>
                  )}
                </div>

                {/* Email ID */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Email ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control radius-8"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    placeholder="Enter Email ID"
                  />
                  {errors.emailId && (
                    <small className="text-danger">{errors.emailId}</small>
                  )}
                </div>

                {/* Business Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Business Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control radius-8"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter Business Name"
                  />
                  {errors.businessName && (
                    <small className="text-danger">{errors.businessName}</small>
                  )}
                </div>

                {/* Business Category */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Business Category <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={categoryOptions}
                    value={
                      categoryOptions.find(
                        (opt) =>
                          String(opt.value) === String(formData.businessCategory),
                      ) || null
                    }
                    onChange={(option) =>
                      handleSelectChange(option, "businessCategory")
                    }
                    placeholder="Select Business Category"
                    isSearchable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={selectStyles(errors.businessCategory)}
                  />
                  {errors.businessCategory && (
                    <small className="text-danger">{errors.businessCategory}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Referred By <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={memberOptions}
                    value={
                      memberOptions.find(
                        (opt) => String(opt.value) === String(formData.referredBy),
                      ) || null
                    }
                    onChange={(option) => handleSelectChange(option, "referredBy")}
                    placeholder="Select Referred Member"
                    isSearchable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={selectStyles(errors.referredBy)}
                  />
                  {errors.referredBy && (
                    <small className="text-danger">{errors.referredBy}</small>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="col-md-12">
              <label className="form-label fw-semibold">
                About
              </label>
              <textarea
                className="form-control radius-8"
                rows="9"
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Enter About Chief Guest"
              ></textarea>
            </div>

            {/* Location */}
            {/* <div className="col-md-6">
              <label className="form-label fw-semibold">
                Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter Location"
              />
              {errors.location && (
                <small className="text-danger">{errors.location}</small>
              )}
            </div> */}

            {/* Referred By */}
            {/* <div className="col-md-6">
              <label className="form-label fw-semibold">
                Referred By <span className="text-danger">*</span>
              </label>
              <Select
                options={memberOptions}
                value={
                  memberOptions.find(
                    (opt) => String(opt.value) === String(formData.referredBy),
                  ) || null
                }
                onChange={(option) => handleSelectChange(option, "referredBy")}
                placeholder="Select Referred Member"
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={selectStyles(errors.referredBy)}
              />
              {errors.referredBy && (
                <small className="text-danger">{errors.referredBy}</small>
              )}
            </div> */}

            {/* Address */}
            {/* <div className="col-md-12">
              <label className="form-label fw-semibold">
                Address <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control radius-8"
                rows="4"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
              ></textarea>
              {errors.address && (
                <small className="text-danger">{errors.address}</small>
              )}
            </div> */}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/chief-guest-list"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            {hasPermission("Chief Guest List", isEditMode ? "edit" : "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                disabled={loading}
                style={{ width: "120px" }}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : isEditMode ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChiefGuestFormLayer;
