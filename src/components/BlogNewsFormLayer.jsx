import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Icon } from "@iconify/react";
import BlogApi from "../Api/BlogApi";
import MediaCategoryApi from "../Api/MediaCategoryApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";

const BlogNewsFormLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: "",
        publishDate: "",
        startTime: "",
        endTime: "",
        location: "",
        shortDescription: "",
        description: "",
        categoryId: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        status: "Active"
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state for quick category creation
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [categoryLoading, setCategoryLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const catRes = await MediaCategoryApi.getAllCategories();
            if (catRes.status) {
                const data = catRes.response.data || catRes.response;
                setCategories(data);
            }

            if (isEdit) {
                const blogRes = await BlogApi.getBlogById(id);
                if (blogRes.status && blogRes.response.data) {
                    const data = blogRes.response.data;
                    setFormData({
                        title: data.title || "",
                        publishDate: data.publishDate ? data.publishDate.split('T')[0] : "",
                        startTime: data.startTime || "",
                        endTime: data.endTime || "",
                        location: data.location || "",
                        shortDescription: data.shortDescription || "",
                        description: data.description || "",
                        categoryId: data.categoryId || "",
                        slug: data.slug || "",
                        metaTitle: data.metaTitle || "",
                        metaDescription: data.metaDescription || "",
                        metaKeywords: data.metaKeywords || "",
                        status: data.status || "Active"
                    });
                    if (data.image) {
                        setExistingImage(data.image);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching initial data", error);
        } finally {
            setLoading(false);
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

    const handleCategorySelectChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, categoryId: selectedOption ? selectedOption.value : "" }));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setCategoryLoading(true);
        try {
            const res = await MediaCategoryApi.createCategory({ name: newCategoryName });
            if (res.status) {
                const createdCat = res.response.data;
                setCategories(prev => [createdCat, ...prev]);
                setFormData(prev => ({ ...prev, categoryId: createdCat._id }));
                setShowCategoryModal(false);
                setNewCategoryName("");
            }
        } catch (error) {
            console.error("Error creating category", error);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let blogImageData = existingImage;

            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);
                const uploadRes = await ImageUploadApi.uploadImage({
                    formData: uploadFormData,
                    path: "media",
                });

                if (uploadRes.status) {
                    blogImageData = uploadRes.response.data;
                } else {
                    alert("Image upload failed");
                    setLoading(false);
                    return;
                }
            }

            const payload = {
                ...formData,
                image: blogImageData,
            };

            let response;
            if (isEdit) {
                response = await BlogApi.updateBlog(id, payload);
            } else {
                response = await BlogApi.createBlog(payload);
            }

            if (response && response.status) {
                navigate("/blog-news-list");
            } else {
                alert(response?.response?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving media", error);
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = categories.map(cat => ({
        value: cat._id,
        label: cat.name
    }));

    const selectedCategoryOption = categoryOptions.find(opt => opt.value === formData.categoryId);

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-primary-600 pb-2 mb-0">
                    {isEdit ? "Edit" : "Create"} Media Management
                </h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-4">

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Title <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control radius-8" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" required />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Slug / URL <span className="text-secondary-light ms-1">(Optional)</span>
                            </label>
                            <input type="text" className="form-control radius-8" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. how-to-grow-business" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Category <span className="text-secondary-light ms-1">(Optional)</span>
                            </label>
                            <div className="d-flex gap-2">
                                <div className="flex-grow-1">
                                    <Select
                                        className="radius-8"
                                        options={categoryOptions}
                                        value={selectedCategoryOption}
                                        onChange={handleCategorySelectChange}
                                        placeholder="Select Category"
                                        isClearable
                                        // "No options message" custom component to include a + sign if needed
                                        noOptionsMessage={() => (
                                            <div className="d-flex justify-content-between align-items-center cursor-pointer px-2 py-1" onClick={() => setShowCategoryModal(true)}>
                                                <span>No category found</span>
                                                <Button size="sm" variant="outline-primary"><Icon icon="ic:baseline-plus" /></Button>
                                            </div>
                                        )}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary radius-8 d-flex align-items-center justify-content-center p-0 w-40-px h-40-px"
                                    onClick={() => setShowCategoryModal(true)}
                                    title="Add New Category"
                                >
                                    <Icon icon="ic:baseline-plus" className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Location (Venue)
                            </label>
                            <input type="text" className="form-control radius-8" name="location" value={formData.location} onChange={handleChange} placeholder="Enter Location" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Event Date <span className="text-danger">*</span>
                            </label>
                            <input type="date" className="form-control radius-8" name="publishDate" value={formData.publishDate} onChange={handleChange} required />
                        </div>

                         <div className="col-md-3">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Start Time
                            </label>
                            <input type="time" className="form-control radius-8" name="startTime" value={formData.startTime} onChange={handleChange} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                End Time
                            </label>
                            <input type="time" className="form-control radius-8" name="endTime" value={formData.endTime} onChange={handleChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Cover Image</label>
                            <input
                                type="file"
                                className="form-control radius-8"
                                accept="image/*"
                                onChange={handleImageChange}
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

                        <div className="col-md-12">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Short Description
                            </label>
                            <input type="text" className="form-control radius-8" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Enter Short Description" />
                        </div>

                        <div className="col-12 mb-20 mt-24">
                            <label className="form-label fw-semibold mb-8 border-bottom pb-8 w-100">
                                SEO Information
                            </label>
                            <div className="row gy-3 mt-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Meta Title</label>
                                    <input type="text" className="form-control radius-8" name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="Enter Meta Title" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Tags / Keywords</label>
                                    <input type="text" className="form-control radius-8" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} placeholder="Enter Tags (comma separated)" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Meta Description</label>
                                    <textarea className="form-control radius-8" name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="Enter Meta Description" rows="3"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 mb-20">
                            <label className="form-label fw-semibold mb-8">
                                Description <span className="text-danger">*</span>
                            </label>
                            <style>{`
                                .custom-quill .ql-editor { min-height: 250px; }
                            `}</style>
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={handleQuillChange}
                                className="custom-quill"
                                placeholder="Enter Media Description"
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

            {/* Quick Category Creation Modal */}
            <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-primary-600 text-md">Add New Media Category</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-24">
                    <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Category Name</label>
                        <input
                            type="text"
                            className="form-control radius-8"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            autoFocus
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 p-24 pt-0">
                    <Button variant="outline-danger" onClick={() => setShowCategoryModal(false)} disabled={categoryLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateCategory} disabled={categoryLoading || !newCategoryName.trim()}>
                        {categoryLoading ? "Creating..." : "Create Category"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BlogNewsFormLayer;
