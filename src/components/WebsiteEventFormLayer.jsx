import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EventApi from "../Api/EventApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDate } from "../helper/DateHelper";
import StandardDatePicker from "./StandardDatePicker";

const WebsiteEventFormLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        venue: "",
        details: "",
        image: null
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        setLoading(true);
        const res = await EventApi.getEventById(id);
        if (res.status) {
            const data = res.response;
            setFormData({
                title: data.title || "",
                date: data.date || "", // Use full date string for StandardDatePicker
                venue: data.venue || "",
                details: data.details || "",
                image: data.image || null // Store existing image object
            });
            if (data.image) {
                setImagePreview(`${IMAGE_BASE_URL}/${data.image.path}`);
            }
        } else {
            toast.error(res.response?.message || "Failed to fetch event details");
            navigate("/website-event-list");
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
            if (errors.image) {
                setErrors({ ...errors, image: "" });
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.venue.trim()) newErrors.venue = "Venue is required";
        if (!formData.details.trim()) newErrors.details = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        let imageToSave = formData.image;

        // If image is a File object, upload it
        if (formData.image instanceof File) {
            const formDataUpload = new FormData();
            formDataUpload.append("file", formData.image);

            const imageRes = await ImageUploadApi.uploadImage({ formData: formDataUpload, path: "event" });

            if (imageRes.status) {
                imageToSave = imageRes.response.data; // Assuming your API returns { status: true, response: { data: { ... } } } or similar check previous fix
            } else {
                toast.error(imageRes.response?.message || "Image upload failed");
                setIsSubmitting(false);
                return;
            }
        }

        const payload = {
            title: formData.title,
            details: formData.details,
            venue: formData.venue,
            date: formData.date,
            image: imageToSave
        };

        let res;
        if (id) {
            res = await EventApi.updateEvent(id, payload);
        } else {
            res = await EventApi.createEvent(payload);
        }

        if (res.status) {
            toast.success(id ? "Event updated successfully" : "Event created successfully");
            navigate("/website-event-list");
        } else {
            toast.error(res.response?.message || `Failed to ${id ? "update" : "create"} event`);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return <div className="p-24 text-center">Loading...</div>;
    }

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-primary-600 mb-0">{id ? "Edit Event" : "Add New Event"}</h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={onSubmit}>
                    <div className="row gy-4">

                        {/* Title */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Event Title<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="form-control radius-8"
                                placeholder="Enter Event Title"
                            />
                            {errors.title && <span className="text-danger-600 text-sm">{errors.title}</span>}
                        </div>

                        {/* Date */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Event Date<span className="text-danger">*</span></label>
                            <StandardDatePicker
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                            />
                            {errors.date && <span className="text-danger-600 text-sm">{errors.date}</span>}
                        </div>

                        {/* Venue */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Venue<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                className="form-control radius-8"
                                placeholder="Enter Venue"
                            />
                            {errors.venue && <span className="text-danger-600 text-sm">{errors.venue}</span>}
                        </div>

                        {/* Image */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Image</label>
                            <input
                                type="file"
                                className="form-control radius-8"
                                accept="image/*"
                                onChange={onImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-8">
                                    <img src={imagePreview} alt="Preview" className="w-120-px h-120-px object-fit-cover radius-8" />
                                </div>
                            )}
                        </div>


                        {/* Description */}
                        <div className="col-12">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Description<span className="text-danger">*</span></label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                                className="form-control radius-8"
                                rows="4"
                                placeholder="Enter Description"
                            ></textarea>
                            {errors.details && <span className="text-danger-600 text-sm">{errors.details}</span>}
                        </div>

                        <div className="col-12 d-flex justify-content-end gap-2 mt-24">
                            <button
                                type="button"
                                className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
                                style={{ width: "120px" }}
                                onClick={() => navigate("/website-event-list")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                                style={{ width: "120px" }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : (id ? "Update" : "Save")}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WebsiteEventFormLayer;
