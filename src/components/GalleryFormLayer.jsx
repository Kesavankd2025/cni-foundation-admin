import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import GalleryApi from "../Api/GalleryApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const GalleryFormLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: "",
        type: "Photo",
        isMultiple: false,
        about: "",
        status: "Active"
    });
    
    const [mediaList, setMediaList] = useState([]); // List of { file, preview, url, existing, fileName, path, originalName }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchGalleryDetails();
        }
    }, [id]);

    const fetchGalleryDetails = async () => {
        try {
            const res = await GalleryApi.getGalleryById(id);
            if (res.status && res.response.data) {
                const data = res.response.data;
                setFormData({
                    title: data.title || "",
                    type: data.type || "Photo",
                    isMultiple: data.isMultiple || false,
                    about: data.about || "",
                    status: data.status || "Active"
                });
                
                if (data.media && Array.isArray(data.media)) {
                    setMediaList(data.media.map(m => ({
                        ...m,
                        preview: m.path ? `${IMAGE_BASE_URL}/${m.path}` : null,
                        existing: true
                    })));
                }
            }
        } catch (error) {
            console.error("Error fetching gallery details", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newMedia = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            existing: false
        }));

        if (formData.isMultiple) {
            setMediaList(prev => [...prev, ...newMedia]);
        } else {
            // Cleanup old previews if single
            mediaList.forEach(m => {
                if (!m.existing && m.preview) URL.revokeObjectURL(m.preview);
            });
            setMediaList(newMedia);
        }
    };

    const handleAddVideoUrl = () => {
        const url = prompt("Enter Video URL (YouTube, Vimeo, etc.)");
        if (url) {
            const newMedia = { url, existing: false };
            if (formData.isMultiple) {
                setMediaList(prev => [...prev, newMedia]);
            } else {
                setMediaList([newMedia]);
            }
        }
    };

    const removeMedia = (index) => {
        const item = mediaList[index];
        if (!item.existing && item.preview) {
            URL.revokeObjectURL(item.preview);
        }
        setMediaList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mediaList.length === 0) {
            alert("Please add at least one image or video URL.");
            return;
        }
        setLoading(true);

        try {
            const finalMedia = [];

            for (const item of mediaList) {
                if (item.existing) {
                    finalMedia.push({
                        fileName: item.fileName,
                        path: item.path,
                        originalName: item.originalName,
                        url: item.url
                    });
                } else if (item.file) {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", item.file);
                    const uploadRes = await ImageUploadApi.uploadImage({
                        formData: uploadFormData,
                        path: "gallery",
                    });
                    if (uploadRes.status) {
                        finalMedia.push(uploadRes.response.data);
                    }
                } else if (item.url) {
                    finalMedia.push({ url: item.url });
                }
            }

            const payload = {
                ...formData,
                media: finalMedia
            };

            let res;
            if (isEdit) {
                res = await GalleryApi.updateGallery(id, payload);
            } else {
                res = await GalleryApi.createGallery(payload);
            }

            if (res.status) {
                navigate("/gallery-list");
            } else {
                alert(res.response.message || "Failed to save gallery");
            }
        } catch (error) {
            console.error("Error saving gallery", error);
            alert("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card h-100 p-0 radius-12 shadow-sm border-0">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                <h6 className="text-primary-600 pb-2 mb-0">
                    {isEdit ? "Edit" : "Create"} Gallery
                </h6>
                <Icon icon="solar:album-outline" className="text-2xl text-primary-600" />
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-4">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Gallery Title <span className="text-danger">*</span>
                            </label>
                            <input type="text" className="form-control radius-8" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Gallery Title" required />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Type <span className="text-danger">*</span>
                            </label>
                            <select className="form-select radius-8" name="type" value={formData.type} onChange={handleChange} required>
                                <option value="Photo">Photo</option>
                                <option value="Video">Video</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Mode Selection</label>
                            <div className="form-check form-switch mt-8">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    name="isMultiple" 
                                    checked={formData.isMultiple} 
                                    onChange={handleChange} 
                                    id="isMultipleSwitch"
                                />
                                <label className="form-check-label fw-medium text-secondary-light" htmlFor="isMultipleSwitch">
                                    {formData.isMultiple ? "Multiple Items" : "Single Item"}
                                </label>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                {formData.type} Content {formData.isMultiple ? "(Allow Multiple)" : "(Single Only)"} <span className="text-danger">*</span>
                            </label>
                            
                            <div className="d-flex flex-wrap gap-x-3 gap-y-4">
                                {(formData.isMultiple || mediaList.length === 0) && (
                                    formData.type === "Photo" ? (
                                        <div className="upload-box d-flex align-items-center justify-content-center flex-column radius-12 border border-dashed bg-neutral-50" style={{ width: "200px", height: "150px", cursor: "pointer", position: "relative" }}>
                                            <input 
                                                type="file" 
                                                className="w-100 h-100 opacity-0 position-absolute" 
                                                style={{ top: 0, left: 0, cursor: "pointer", zIndex: 2 }}
                                                onChange={handleFileChange}
                                                multiple={formData.isMultiple}
                                                accept="image/*"
                                            />
                                            <Icon icon="solar:camera-add-linear" className="text-4xl text-primary-600 mb-8" />
                                            <span className="text-xs fw-medium text-secondary-light">Upload Images</span>
                                            <span className="text-xxs text-neutral-400 mt-4">(Max 5MB each)</span>
                                        </div>
                                    ) : (
                                        <button 
                                            type="button" 
                                            className="upload-box d-flex align-items-center justify-content-center flex-column radius-12 border border-dashed bg-neutral-50" 
                                            style={{ width: "200px", height: "150px" }}
                                            onClick={handleAddVideoUrl}
                                        >
                                            <Icon icon="solar:videocamera-add-linear" className="text-4xl text-primary-600 mb-8" />
                                            <span className="text-xs fw-medium text-secondary-light">Add Video Link</span>
                                            <span className="text-xxs text-neutral-400 mt-4">(YT, Vimeo, etc.)</span>
                                        </button>
                                    )
                                )}

                                {mediaList.map((item, index) => (
                                    <div key={index} className="position-relative shadow-sm radius-12 overflow-visible" style={{ width: "200px", height: "150px" }}>
                                        {formData.type === "Photo" ? (
                                            <img src={item.preview} className="w-100 h-100 object-fit-cover radius-12 border" alt="preview" />
                                        ) : (
                                            <div className="w-100 h-100 radius-12 border bg-neutral-50 d-flex flex-column align-items-center justify-content-center p-12 text-center">
                                                <Icon icon="logos:youtube-icon" className="text-2xl mb-8" />
                                                <span className="text-xs text-secondary-light text-break w-100" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.url}</span>
                                            </div>
                                        )}
                                        <button 
                                            type="button" 
                                            className="btn btn-danger btn-sm rounded-circle position-absolute d-flex align-items-center justify-content-center p-0 border-white border-2" 
                                            style={{ top: "-8px", right: "-8px", width: "24px", height: "24px", zIndex: 3 }}
                                            onClick={() => removeMedia(index)}
                                            title="Remove Item"
                                        >
                                            <Icon icon="iconoir:cancel" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-md-12">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">About / Description</label>
                            <textarea 
                                className="form-control radius-8" 
                                name="about" 
                                value={formData.about} 
                                onChange={handleChange} 
                                placeholder="Describe the contents of this gallery..." 
                                rows="4"
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Visibility Status</label>
                            <select className="form-select radius-8" name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active (Visible)</option>
                                <option value="Inactive">Inactive (Hidden)</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-40">
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-danger-600 px-32 radius-8 fw-medium">Cancel</button>
                        <button type="submit" className="btn btn-primary radius-8 px-40 fw-medium d-flex align-items-center gap-2" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:diskette-bold" />
                                    {isEdit ? "Update Gallery" : "Save Gallery"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GalleryFormLayer;
