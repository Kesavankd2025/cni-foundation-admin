import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MediaCategoryApi from "../Api/MediaCategoryApi";

const MediaCategoryFormLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: "",
        status: "Active"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const res = await MediaCategoryApi.getAllCategories();
            if (res.status) {
                const categories = res.response.data || res.response;
                const category = categories.find(c => c._id === id);
                if (category) {
                    setFormData({
                        name: category.name,
                        status: category.status
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching category", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (isEdit) {
                res = await MediaCategoryApi.updateCategory(id, formData);
            } else {
                res = await MediaCategoryApi.createCategory(formData);
            }

            if (res.status) {
                navigate(-1);
            }
        } catch (error) {
            console.error("Error saving category", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-primary-600 pb-2 mb-0">
                    {isEdit ? "Edit" : "Create"} Media Category
                </h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-4">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Category Name <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control radius-8"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter Category Name"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Status
                            </label>
                            <select
                                className="form-select radius-8"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
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

export default MediaCategoryFormLayer;
