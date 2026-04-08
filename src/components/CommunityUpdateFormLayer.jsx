import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StandardDatePicker from "./StandardDatePicker";
import usePermissions from "../hook/usePermissions";

const CommunityUpdateFormLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    publishDate: "",
    attachment: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Community Update Data:", formData);
    // Add your save logic here
    alert("Community Update submitted successfully!");
    navigate("/community-update");
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header bg-transparent border-bottom px-24 py-16">
        <h6 className="text-primary-600 pb-2 mb-0">Create Community Update</h6>
      </div>

      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Title <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="Enter update title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">
                  Category <span className="text-danger-600">*</span>
                </label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Event">Event</option>
                  <option value="News">News</option>
                  <option value="Achievement">Achievement</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Publish Date <span className="text-danger-600">*</span>
                </label>
                <StandardDatePicker
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Attachment</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <div className="form-text">Upload image or PDF (optional)</div>
              </div>
            </div>

            <div className="col-12">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Description <span className="text-danger-600">*</span>
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="6"
                  placeholder="Enter update description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
            </div>

            <div className="col-12 mt-7 pt-4 ">
              <div className="d-flex justify-content-end gap-3">
                <Link
                  to="/community-update"
                  className="btn btn-outline-secondary px-32 justify-content-center"
                  style={{ width: "120px" }}
                >
                  Cancel
                </Link>
                {hasPermission("Community Update", "add") && (
                  <button
                    type="submit"
                    className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                  //     "style={{
                  //       backgroundColor: "#003366",
                  // borderColor: "#003366",
                  // width: "120px",
                  //     }}
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div >
    </div >
  );
};

export default CommunityUpdateFormLayer;
