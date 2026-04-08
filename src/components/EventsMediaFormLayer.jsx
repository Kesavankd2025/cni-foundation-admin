import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Icon } from "@iconify/react";
import EventApi from "../Api/EventApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const EventsMediaFormLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    shortDescription: "",
    description: "",
    isActive: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await EventApi.getEventById(id);
      if (res.status && res.response.data) {
        const data = res.response.data;
        setFormData({
          title: data.title || "",
          date: data.date ? data.date.split('T')[0] : "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          location: data.location || data.venue || "",
          shortDescription: data.shortDescription || "",
          description: data.details || "",
          isActive: data.isActive
        });
        if (data.image) {
          setExistingImage(data.image);
        }
      }
    } catch (error) {
      console.error("Error fetching event details", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
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
      let eventImageData = existingImage;

      // Upload new image if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        const uploadRes = await ImageUploadApi.uploadImage({
          formData: uploadFormData,
          path: "events",
        });

        if (uploadRes.status) {
          eventImageData = uploadRes.response.data;
        } else {
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        eventImage: eventImageData,
      };

      let response;
      if (isEdit) {
        response = await EventApi.updateEvent(id, payload);
      } else {
        response = await EventApi.createEvent(payload);
      }

      if (response && response.status) {
        navigate("/events-media-list");
      }
    } catch (error) {
      console.error("Error saving event", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEdit ? "Edit" : "Create"} Events & Media
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Event Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Event Title"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Event Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control radius-8"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Start Time
              </label>
              <input
                type="time"
                className="form-control radius-8"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                End Time
              </label>
              <input
                type="time"
                className="form-control radius-8"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter Event Location"
                required
              />
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Short Description
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Enter Short Description"
              />
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Event Image {!isEdit && <span className="text-danger">*</span>}
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-120-px h-120-px object-fit-cover radius-8 border"
                  />
                </div>
              ) : existingImage && existingImage.path && (
                <div className="mt-8">
                  <img
                    src={`${IMAGE_BASE_URL}/${existingImage.path}`}
                    alt="Current"
                    className="w-120-px h-120-px object-fit-cover radius-8 border"
                  />
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold mb-8">
                Description <span className="text-danger">*</span>
              </label>
              <style>{`
                .custom-quill .ql-editor { min-height: 200px; }
              `}</style>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={handleQuillChange}
                className="custom-quill"
                placeholder="Enter Event Details"
              />
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

export default EventsMediaFormLayer;
