import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestimonialApi from "../Api/TestimonialApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { toast } from "react-toastify";

const TestimonialsFormLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    customerName: "",
    designation: "",
    message: "",
    isActive: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchTestimonial();
    }
  }, [id]);

  const fetchTestimonial = async () => {
    try {
      const res = await TestimonialApi.getTestimonialById(id);
      if (res.status && res.response.data) {
        const data = res.response.data;
        setFormData({
          customerName: data.customerName || "",
          designation: data.designation || "",
          message: data.message || "",
          isActive: data.isActive
        });
        if (data.image) {
          setExistingImage(data.image);
        }
      }
    } catch (error) {
      console.error("Error fetching testimonial", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageData = existingImage;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        const uploadRes = await ImageUploadApi.uploadImage({
          formData: uploadFormData,
          path: "testimonials",
        });

        if (uploadRes.status) {
          imageData = uploadRes.response.data;
        } else {
          toast.error("Image upload failed");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        image: imageData,
      };

      let response;
      if (isEdit) {
        response = await TestimonialApi.updateTestimonial(id, payload);
      } else {
        response = await TestimonialApi.createTestimonial(payload);
      }

      if (response && response.status) {
        toast.success(isEdit ? "Testimonial updated successfully" : "Testimonial created successfully");
        navigate("/testimonials-list");
      } else {
        toast.error(response?.response?.message || "Failed to save testimonial");
      }
    } catch (error) {
      console.error("Error saving testimonial", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEdit ? "Edit" : "Create"} Testimonial
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Customer Name <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                className="form-control radius-8" 
                name="customerName" 
                value={formData.customerName} 
                onChange={handleChange} 
                placeholder="Enter Customer Name" 
                required 
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Designation <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                className="form-control radius-8" 
                name="designation" 
                value={formData.designation} 
                onChange={handleChange} 
                placeholder="Enter Designation" 
                required 
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Customer Image {!isEdit && <span className="text-danger">*</span>}
              </label>
              <input
                type="file"
                className="form-control radius-8"
                accept="image/*"
                onChange={handleImageChange}
                required={!isEdit && !existingImage}
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
                name="isActive" 
                value={formData.isActive} 
                onChange={handleChange}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Message <span className="text-danger">*</span>
              </label>
              <textarea 
                className="form-control radius-8" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Enter Message" 
                rows="4" 
                required
              ></textarea>
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
    </div>
  );
};

export default TestimonialsFormLayer;
