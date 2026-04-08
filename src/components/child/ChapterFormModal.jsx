import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import StandardDatePicker from "../StandardDatePicker";

const ChapterFormModal = ({ show, handleClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    chapterName: "",
    country: "",
    state: "",
    zone: "",
    mentors: "",
    inductionDirectors: "",
    createdDate: "",
    meetingDateTime: "",
    location: "",
    weekday: "",
    meetingType: "In Person",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form on open if no data (Add mode)
      setFormData({
        chapterName: "",
        country: "",
        state: "",
        zone: "",
        mentors: "",
        inductionDirectors: "",
        createdDate: "",
        meetingDateTime: "",
        location: "",
        weekday: "",
        meetingType: "In Person",
      });
    }
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="xl"
      className="modal-custom"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {initialData ? "Edit Chapter" : "Add Chapter"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            {/* Chapter Name */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Chapter Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="chapterName"
                value={formData.chapterName}
                onChange={handleChange}
                placeholder="Enter Chapter Name"
                required
              />
            </div>

            {/* Country */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Country <span className="text-danger">*</span>
              </label>
              <select
                className="form-select radius-8"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
            </div>

            {/* State */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                State <span className="text-danger">*</span>
              </label>
              <select
                className="form-select radius-8"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            {/* Zone */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Zone <span className="text-danger">*</span>
              </label>
              <select
                className="form-select radius-8"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
              >
                <option value="">Select Zone</option>
                <option value="Zone 1">Zone 1</option>
                <option value="Zone 2">Zone 2</option>
              </select>
            </div>

            {/* Mentors */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Chapter Mentors <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="mentors"
                value={formData.mentors}
                onChange={handleChange}
                placeholder="Select Mentors"
                required
              />
            </div>

            {/* Induction Directors */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Induction Directors <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="inductionDirectors"
                value={formData.inductionDirectors}
                onChange={handleChange}
                placeholder="Select Directors"
                required
              />
            </div>

            {/* Created Date */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Chapter Created Date <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="createdDate"
                value={formData.createdDate}
                onChange={handleChange}
              />
            </div>

            {/* Meeting Date & Time */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Meeting Date & Time <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="meetingDateTime"
                value={formData.meetingDateTime}
                onChange={handleChange}
                enableTime={true}
              />
            </div>

            {/* Location */}
            <div className="col-md-6">
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
                required
              />
            </div>

            {/* Weekday */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Weekday <span className="text-danger">*</span>
              </label>
              <select
                className="form-select radius-8"
                name="weekday"
                value={formData.weekday}
                onChange={handleChange}
                required
              >
                <option value="">Select Weekday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            {/* Meeting Type (Optional) */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Meeting Type</label>
              <select
                className="form-select radius-8"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
              >
                <option value="In Person">In Person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              className="radius-8 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-600"
              className="radius-8 px-4"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ChapterFormModal;
