import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import StandardDatePicker from "./StandardDatePicker";

const VisitorsFormLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Determine mode based on URL
  const isEditMode = location.pathname.includes("/edit/");
  const isViewMode = location.pathname.includes("/view/");
  const isAddMode = !id || location.pathname.includes("/add");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    businessCategory: "",
    companyName: "",
    address: "",
    mobileNo: "",
    emailId: "",
    invitedBy: "",
    isInterested: "",
    experience: "",
    comments: "",
    date: "",
    businessManager: "",
    chapterName: "",
    city: "",
    sourceOfEvent: "",
    signature: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.mobileNo) newErrors.mobileNo = "Mobile number is required";
    else if (formData.mobileNo.length !== 10) newErrors.mobileNo = "Mobile number must be 10 digits";

    if (formData.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = "Invalid Email Format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load data if in edit or view mode
  useEffect(() => {
    if (id) {
      // Mock fetching data
      // In a real app, you would fetch from an API
      const mockVisitor = {
        name: "Rajesh Kumar",
        mobileNo: "9876504320",
        businessCategory: "Software Solutions",
        sourceOfEvent: "Intro Meet",
        invitedBy: "Logarajan S P",
        status: "Yes",
        companyName: "ABC Corp",
        address: "123 Main St, City",
        emailId: "visitor@example.com",
        experience: "Excellent",
        comments: "Very productive meeting.",
        date: "2025-01-25",
        businessManager: "Manager X",
        chapterName: "ARAM Chapter",
        city: "Chennai",
      };

      setFormData({
        name: mockVisitor.name,
        businessCategory: mockVisitor.businessCategory,
        companyName: mockVisitor.companyName,
        address: mockVisitor.address,
        mobileNo: mockVisitor.mobileNo,
        emailId: mockVisitor.emailId,
        invitedBy: mockVisitor.invitedBy,
        isInterested: mockVisitor.status,
        experience: mockVisitor.experience,
        comments: mockVisitor.comments,
        date: mockVisitor.date,
        businessManager: mockVisitor.businessManager,
        chapterName: mockVisitor.chapterName,
        city: mockVisitor.city,
        sourceOfEvent: mockVisitor.sourceOfEvent,
        signature: mockVisitor.name,
      });
    }
  }, [id]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === "mobileNo") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Logic to save or update visitor
    alert("Visitor Information Saved successfully!");
    navigate("/visitors-report");
  };

  const handleCancel = () => {
    navigate("/visitors-report");
  };

  return (
    <div className="card h-100 p-0 radius-12 border-0 shadow-sm">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={handleCancel}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 radius-8"
          >
            <Icon icon="ion:arrow-back-outline" />
            Back
          </button>
          <h6 className="text-primary-600 mb-0">
            {isAddMode
              ? "Add Visitor"
              : isEditMode
                ? "Edit Visitor"
                : "View Visitor Details"}
          </h6>
        </div>
      </div>

      <div className="card-body p-24" style={{ backgroundColor: "#fcfcfc" }}>
        <form onSubmit={handleSave}>
          <div className="text-center mb-40">
            <h3
              className="fw-bolder"
              style={{ color: "#101828", letterSpacing: "2px" }}
            >
              VISITOR'S INTEREST FORM
            </h3>
            <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
              <div
                style={{ height: "2px", width: "60px", background: "#003366" }}
              ></div>
              <span className="text-secondary-light fw-bold fs-5">
                CNI - Construction Network of India
              </span>
              <div
                style={{ height: "2px", width: "60px", background: "#003366" }}
              ></div>
            </div>
          </div>

          <div className="row g-4">
            {/* Basic Info */}
            <div className="col-lg-6">
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-lg radius-8"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  required
                />
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Business Category
                </label>
                <input
                  type="text"
                  name="businessCategory"
                  className="form-control form-control-lg radius-8"
                  value={formData.businessCategory}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Name of the Company
                </label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control form-control-lg radius-8"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Address
                </label>
                <textarea
                  name="address"
                  className="form-control radius-8"
                  rows="4"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                ></textarea>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Mobile No
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  className="form-control form-control-lg radius-8"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  required
                />
                {errors.mobileNo && (
                  <small className="text-danger">{errors.mobileNo}</small>
                )}
              </div>
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Email Id
                </label>
                <input
                  type="email"
                  name="emailId"
                  className="form-control form-control-lg radius-8"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
                {errors.emailId && (
                  <small className="text-danger">{errors.emailId}</small>
                )}
              </div>
              <div className="form-group mb-4">
                <label className="form-label fw-bold text-dark fs-6">
                  Invited by
                </label>
                <input
                  type="text"
                  name="invitedBy"
                  className="form-control form-control-lg radius-8"
                  value={formData.invitedBy}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Interest & Experience */}
            <div className="col-md-6 mt-4">
              <div className="card border-0 shadow-sm p-24 radius-16 bg-white h-100">
                <label className="fw-bold text-dark mb-20 fs-6">
                  Are you Interested to become a Member of CNI ?
                </label>
                <div className="d-flex gap-5 flex-wrap">
                  {["Yes", "May be", "No"].map((opt) => (
                    <div key={opt} className="form-check custom-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="isInterested"
                        id={`interest_${opt}`}
                        value={opt}
                        checked={formData.isInterested === opt}
                        onChange={handleInputChange}
                        disabled={isViewMode}
                      />
                      <label
                        className="form-check-label fw-medium cursor-pointer"
                        htmlFor={`interest_${opt}`}
                      >
                        {opt}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6 mt-4">
              <div className="card border-0 shadow-sm p-24 radius-16 bg-white h-100">
                <label className="fw-bold text-dark mb-20 fs-6">
                  How was your Experience in this Meeting ?
                </label>
                <div className="d-flex gap-5 flex-wrap">
                  {["Fair", "Good", "Excellent"].map((opt) => (
                    <div key={opt} className="form-check custom-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="experience"
                        id={`exp_${opt}`}
                        value={opt}
                        checked={formData.experience === opt}
                        onChange={handleInputChange}
                        disabled={isViewMode}
                      />
                      <label
                        className="form-check-label fw-medium cursor-pointer"
                        htmlFor={`exp_${opt}`}
                      >
                        {opt}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="col-12 mt-32">
              <div className="card border-0 shadow-sm radius-16 overflow-hidden">
                <div className="bg-primary-600 py-12 text-center">
                  <span className="text-white fw-bold text-sm text-uppercase spacing-1">
                    Comments & Feedback about Meeting
                  </span>
                </div>
                <div className="p-24 bg-white">
                  <textarea
                    name="comments"
                    className="form-control border-0 bg-neutral-50 radius-8 p-16"
                    rows="4"
                    placeholder="Write your comments here..."
                    value={formData.comments}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  ></textarea>
                  <div className="row mt-40 align-items-end">
                    <div className="col-md-6">
                      <div className="form-group mb-0">
                        <label className="form-label fw-bold text-dark fs-6 mb-8">Date :</label>
                        <StandardDatePicker
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="form-control w-auto border-0 border-bottom radius-0 bg-transparent px-2"
                          minDate={isViewMode ? undefined : "today"}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <div
                        className="d-inline-block text-center border-top border-dark pt-2"
                        style={{ width: "200px" }}
                      >
                        <input
                          type="text"
                          name="signature"
                          className="form-control border-0 bg-transparent text-center fw-bold italic-font"
                          style={{ fontStyle: "italic", fontFamily: "cursive" }}
                          placeholder="Type Signature"
                          value={formData.signature}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                        />
                        <span className="text-secondary-light fw-bold small">
                          Signature of Visitor
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Purpose */}
            <div className="col-12 mt-32">
              <div className="card border-0 shadow-sm radius-16 overflow-hidden">
                <div className="bg-dark py-12 text-center">
                  <span className="text-white fw-bold text-sm text-uppercase spacing-1">
                    Official Purpose
                  </span>
                </div>
                <div className="p-32 bg-white">
                  <div className="row g-4">
                    <div className="col-md-12">
                      <div className="form-group d-flex align-items-center gap-3">
                        <label className="mb-0 text-nowrap fw-bold text-dark">
                          Name of the Business Manager :
                        </label>
                        <input
                          type="text"
                          name="businessManager"
                          className="form-control border-0 border-bottom radius-0 bg-transparent px-2 flex-grow-1"
                          value={formData.businessManager}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div className="col-md-7">
                      <div className="form-group d-flex align-items-center gap-3">
                        <label className="mb-0 text-nowrap fw-bold text-dark">
                          Chapter Name :
                        </label>
                        <input
                          type="text"
                          name="chapterName"
                          className="form-control border-0 border-bottom radius-0 bg-transparent px-2 flex-grow-1"
                          value={formData.chapterName}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="form-group d-flex align-items-center gap-3">
                        <label className="mb-0 text-nowrap fw-bold text-dark">
                          City :
                        </label>
                        <input
                          type="text"
                          name="city"
                          className="form-control border-0 border-bottom radius-0 bg-transparent px-2 flex-grow-1"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div className="col-12 mt-24">
                      <div className="d-flex flex-wrap align-items-center gap-4">
                        <label className="mb-0 fw-bold text-dark">
                          Source of Event :
                        </label>
                        {[
                          "Intro Meet",
                          "Coffee Meet",
                          "MVD",
                          "Chapter Meet",
                          "Pre Launch Meet",
                        ].map((src) => (
                          <div key={src} className="form-check custom-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="sourceOfEvent"
                              id={`src_${src}`}
                              value={src}
                              checked={formData.sourceOfEvent === src}
                              onChange={handleInputChange}
                              disabled={isViewMode}
                            />
                            <label
                              className="form-check-label text-sm fw-medium"
                              htmlFor={`src_${src}`}
                            >
                              {src}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-40">
                    <div
                      style={{
                        height: "1px",
                        background: "#e0e0e0",
                        marginBottom: "-10px",
                      }}
                    ></div>
                    <span className="bg-white px-20 text-xxs fw-bold text-secondary-light tracking-wide">
                      FEEDBACK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 mt-40 pt-24 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary radius-8 px-32 py-12 justify-content-center"
              onClick={handleCancel}
              style={{ width: "120px" }}
            >
              {isViewMode ? "Go Back" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-40 py-12 d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: "#003366",
                  borderColor: "#003366",
                  width: "120px",
                }}
              >
                <Icon icon="solar:diskette-bold" />
                {isEditMode ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
                .custom-check .form-check-input:checked {
                    background-color: #003366;
                    border-color: #003366;
                }
                .spacing-1 {
                    letter-spacing: 1px;
                }
            `}</style>
    </div>
  );
};

export default VisitorsFormLayer;
