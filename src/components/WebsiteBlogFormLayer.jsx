import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BlogApi from "../Api/BlogApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import StandardDatePicker from "./StandardDatePicker";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const WebsiteBlogFormLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: "",
        publishDate: "",
        description: "",
        status: "Active",
        image: null
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBlogDetails();
        }
    }, [id]);

    const fetchBlogDetails = async () => {
        setLoading(true);
        const res = await BlogApi.getBlogById(id);
        if (res.status) {
            const data = res.response?.data || res.response;
            setFormData({
                title: data.title || "",
                publishDate: data.publishDate || "",
                description: data.description || "",
                status: data.status || "Active",
                image: data.image || null
            });
            if (data.image) {
                setImagePreview(`${IMAGE_BASE_URL}/${data.image.path}`);
            }
        } else {
            toast.error(res.response?.message || "Failed to fetch blog details");
            navigate("/website-blog-list");
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

    const handleDescriptionChange = (value) => {
        setFormData({ ...formData, description: value });
        if (errors.description) {
            setErrors({ ...errors, description: "" });
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
        if (!formData.publishDate) newErrors.publishDate = "Publish Date is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";

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

            const imageRes = await ImageUploadApi.uploadImage({ formData: formDataUpload, path: "blog" });

            if (imageRes.status) {
                imageToSave = imageRes.response.data;
            } else {
                toast.error(imageRes.response?.message || "Image upload failed");
                setIsSubmitting(false);
                return;
            }
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            publishDate: formData.publishDate,
            status: formData.status,
            image: imageToSave
        };

        let res;
        if (id) {
            res = await BlogApi.updateBlog(id, payload);
        } else {
            res = await BlogApi.createBlog(payload);
        }

        if (res.status) {
            toast.success(id ? "Blog updated successfully" : "Blog created successfully");
            navigate("/website-blog-list");
        } else {
            toast.error(res.response?.message || `Failed to ${id ? "update" : "create"} blog`);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return <div className="p-24 text-center">Loading...</div>;
    }

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-primary-600 mb-0">{id ? "Edit Blog" : "Add New Blog"}</h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={onSubmit}>
                    <div className="row gy-4">

                        {/* Title */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Title<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="form-control radius-8"
                                placeholder="Enter Blog Title"
                            />
                            {errors.title && <span className="text-danger-600 text-sm">{errors.title}</span>}
                        </div>

                        {/* Publish Date */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Publish Date<span className="text-danger">*</span></label>
                            <StandardDatePicker
                                name="publishDate"
                                value={formData.publishDate}
                                onChange={handleInputChange}
                            />
                            {errors.publishDate && <span className="text-danger-600 text-sm">{errors.publishDate}</span>}
                        </div>

                        {/* Status */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Status<span className="text-danger">*</span></label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="form-control radius-8"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
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
                        <div className="col-12 mb-20">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Description<span className="text-danger">*</span></label>
                            <style>{`
                                .custom-quill .ql-editor {
                                    min-height: 250px;
                                }
                                .custom-quill .ql-container {
                                    border-bottom-left-radius: 8px;
                                    border-bottom-right-radius: 8px;
                                }
                                .custom-quill .ql-toolbar {
                                    border-top-left-radius: 8px;
                                    border-top-right-radius: 8px;
                                }
                            `}</style>
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                className="custom-quill mb-4"
                                placeholder="Enter Description"
                            />
                            {errors.description && <span className="text-danger-600 text-sm mt-2">{errors.description}</span>}
                        </div>

                        <div className="col-12 d-flex justify-content-end gap-2 mt-24">
                            <button
                                type="button"
                                className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
                                style={{ width: "120px" }}
                                onClick={() => navigate("/website-blog-list")}
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

export default WebsiteBlogFormLayer;
