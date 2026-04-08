import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import BlogApi from "../Api/BlogApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDate } from "../helper/DateHelper";
import { toast } from "react-toastify";

const WebsiteBlogDetailsLayer = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const res = await BlogApi.getBlogById(id);
                if (res.status) {
                    setBlog(res.response?.data || res.response);
                } else {
                    toast.error("Blog not found");
                }
            } catch (error) {
                console.error("Error fetching blog details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-24 text-center">Loading...</div>;
    if (!blog) return <div className="p-24 text-center">Blog not found</div>;

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex justify-content-between align-items-center">
                <h6 className="text-primary-600 mb-0">Blog Details</h6>
                <Link to="/website-blog-list" className="btn btn-secondary-50 text-secondary-light px-20 py-10 radius-8">
                    Back to List
                </Link>
            </div>
            <div className="card-body p-24">
                {/* Blog Info */}
                <div className="row mb-32">
                    <div className="col-md-4">
                        {blog.image ? (
                            <img
                                src={`${IMAGE_BASE_URL}/${blog.image.path}`}
                                alt={blog.title}
                                className="w-100 h-200-px object-fit-cover radius-12"
                            />
                        ) : (
                            <div className="w-100 h-200-px bg-neutral-100 d-flex justify-content-center align-items-center radius-12">
                                <Icon icon="solar:gallery-bold" className="text-secondary-light text-xxl" />
                            </div>
                        )}
                    </div>
                    <div className="col-md-8">
                        <h4 className="mb-16">{blog.title}</h4>
                        <div className="d-flex align-items-center gap-24 mb-16 text-secondary-light">
                            <span className="d-flex align-items-center gap-8">
                                <Icon icon="solar:calendar-date-bold" />
                                Publish Date: {formatDate(blog.publishDate)}
                            </span>
                            <span className="d-flex align-items-center gap-8">
                                <Icon icon="solar:check-circle-bold" />
                                Status: <span className={`badge ${blog.status === 'Active' ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-12 py-2 radius-4 fw-medium text-sm`}>
                                    {blog.status}
                                </span>
                            </span>
                        </div>
                        <div
                            className="text-secondary-light mb-0 editor-content"
                            style={{ whiteSpace: 'pre-wrap' }}
                            dangerouslySetInnerHTML={{ __html: blog.description }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsiteBlogDetailsLayer;
