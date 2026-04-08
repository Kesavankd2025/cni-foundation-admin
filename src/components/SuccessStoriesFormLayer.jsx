import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const SuccessStoriesFormLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    impact: ""
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (name) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting", formData);
    navigate(-1);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          Create/Edit Success Stories & Impact
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Story Title <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control radius-8" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Story Title" required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">Featured Image</label>
              <input
                  type="file"
                  className="form-control radius-8"
                  accept="image/*"
                  onChange={handleImageChange('image')}
              />
              {imagePreview && (
                  <div className="mt-8">
                      <img src={imagePreview} alt="Preview" className="w-120-px h-120-px object-fit-cover radius-8" />
                  </div>
              )}
            </div>
            <div className="col-12 mb-20">
              <label className="form-label fw-semibold mb-8">
                Impact Details <span className="text-danger">*</span>
              </label>
              <style>{`
                  .custom-quill .ql-editor { min-height: 250px; }
                  .custom-quill .ql-container { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
                  .custom-quill .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; }
              `}</style>
              <ReactQuill
                  theme="snow"
                  value={formData.impact}
                  onChange={handleQuillChange('impact')}
                  className="custom-quill mb-4"
                  placeholder="Enter Impact Details"
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-24">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
              style={{ width: "120px" }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SuccessStoriesFormLayer;
