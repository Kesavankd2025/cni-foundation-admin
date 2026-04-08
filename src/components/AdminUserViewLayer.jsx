import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminUserApi from '../Api/AdminUserApi';

const AdminUserViewLayer = () => {
    const { id } = useParams();
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchAdminUser(id);
        }
    }, [id]);

    const fetchAdminUser = async (adminId) => {
        try {
            setLoading(true);
            const response = await AdminUserApi.getAdminUser(adminId);
            if (response && response.status && response.response.data) {
                setAdminData(response.response.data);
            }
        } catch (error) {
            console.error("Error fetching admin details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary-600" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!adminData) {
        return (
            <div className="card h-100 p-24 text-center radius-12 border-0 shadow-sm bg-base">
                <h5 className="text-secondary-light">Admin details not found.</h5>
                <Link to="/admin-registration" className="btn btn-secondary w-fit-content mx-auto mt-16 radius-8">
                    Back to List
                </Link>
            </div>
        );
    }

    const roleName = adminData.roleId?.name || (typeof adminData.roleId === "string" ? adminData.roleId : "Administrator");

    return (
        <div className="container-fluid px-0">
            {/* Header Section - Full Width */}
            <div className="card border-0 shadow-sm radius-12 mb-24 bg-base">
                <div className="card-body p-24">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h6 className="text-primary-600 pb-2 mb-0">Profile</h6>
                            {/* <p className="text-secondary-light mb-0">View and manage administrator details</p> */}
                        </div>
                        <Link to="/admin-registration" className="btn btn-outline-secondary btn-md d-flex align-items-center gap-2 radius-8 px-20">
                            <Icon icon="solar:arrow-left-bold" /> Back to List
                        </Link>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Profile Overview Card - Left Side */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm radius-12 overflow-hidden bg-base h-100">
                        {/* Profile Header with Gradient */}
                        <div className="profile-header-gradient p-32 text-center position-relative">
                            <div className="position-relative d-inline-block mb-3">
                                <div className="avatar-xl rounded-circle border border-4 border-white shadow-lg bg-white overflow-hidden d-flex align-items-center justify-content-center mx-auto">
                                    <div className="w-100 h-100 rounded-circle bg-primary-600 d-flex align-items-center justify-content-center">
                                        <span className="text-white display-5 fw-bold">
                                            {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h5 className="fw-bold mb-2 text-white">{adminData.name}</h5>
                        </div>

                        {/* Profile Details */}
                        <div className="p-24">
                            {/* Quick Stats */}
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="text-center p-3 bg-neutral-50 radius-8">
                                        <Icon icon="solar:shield-user-bold" className="text-primary-600 fs-3 mb-2" />
                                        <p className="text-secondary-light small mb-1 fw-medium">User Role</p>
                                        <p className="fw-bold mb-0 text-dark">{adminData.roleName || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Details Card - Right Side */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm radius-12 bg-base h-100">
                        <div className="card-header bg-transparent border-bottom border-neutral-100 p-24">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0 text-dark">Personal Information</h6>
                                {/* Uncomment when edit is needed */}
                                {/* <Link to={`/admin-registration/edit/${id}`} className="btn btn-primary-600 btn-sm d-flex align-items-center gap-2 radius-8 px-16 text-white">
                                    <Icon icon="solar:pen-bold" /> Edit Profile
                                </Link> */}
                            </div>
                        </div>

                        <div className="card-body p-24">
                            <div className="row g-4">
                                {/* Full Name */}
                                <div className="col-md-6">
                                    <div className="info-box p-20 border border-neutral-100 radius-8 bg-white hover-border-primary transition-2 h-100">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="icon-box bg-primary-focus p-3 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center icon-size">
                                                <Icon icon="solar:user-rounded-bold" className="text-primary-600 fs-4" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-secondary-light small mb-2 fw-semibold text-uppercase letter-spacing">Full Name</p>
                                                <p className="fw-bold mb-0 text-dark fs-6">{adminData.name || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div className="col-md-6">
                                    <div className="info-box p-20 border border-neutral-100 radius-8 bg-white hover-border-primary transition-2 h-100">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="icon-box bg-warning-focus p-3 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center icon-size">
                                                <Icon icon="solar:letter-bold" className="text-warning-main fs-4" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-secondary-light small mb-2 fw-semibold text-uppercase letter-spacing">Email Address</p>
                                                <p className="fw-bold mb-0 text-dark fs-6 text-break">{adminData.email || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Company */}
                                <div className="col-md-6">
                                    <div className="info-box p-20 border border-neutral-100 radius-8 bg-white hover-border-primary transition-2 h-100">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="icon-box bg-info-focus p-3 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center icon-size">
                                                <Icon icon="solar:buildings-bold" className="text-info-main fs-4" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-secondary-light small mb-2 fw-semibold text-uppercase letter-spacing">Company</p>
                                                <p className="fw-bold mb-0 text-dark fs-6">{adminData.companyName || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="col-md-6">
                                    <div className="info-box p-20 border border-neutral-100 radius-8 bg-white hover-border-primary transition-2 h-100">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="icon-box bg-success-focus p-3 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center icon-size">
                                                <Icon icon="solar:phone-bold" className="text-success-main fs-4" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-secondary-light small mb-2 fw-semibold text-uppercase letter-spacing">Phone Number</p>
                                                <p className="fw-bold mb-0 text-dark fs-6">{adminData.phoneNumber || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .letter-spacing { letter-spacing: 0.5px; }
                .text-white-70 { color: rgba(255, 255, 255, 0.85); }
                .icon-size { width: 48px; height: 48px; }
                
                .bg-primary-focus { background-color: rgba(0, 51, 102, 0.1); }
                .bg-info-focus { background-color: rgba(13, 202, 240, 0.1); }
                .bg-success-focus { background-color: rgba(25, 135, 84, 0.1); }
                .bg-warning-focus { background-color: rgba(255, 193, 7, 0.1); }
                .bg-danger-focus { background-color: rgba(220, 53, 69, 0.1); }
                
                .text-primary-600 { color: #003366 !important; }
                .btn-primary-600 { background-color: #003366 !important; border-color: #003366 !important; }
                .bg-primary-600 { background-color: #003366 !important; }
                .btn-outline-primary { 
                    color: #003366 !important; 
                    border-color: #003366 !important; 
                }
                .btn-outline-primary:hover { 
                    background-color: #003366 !important; 
                    color: white !important;
                }
                
                .profile-header-gradient {
                    background: linear-gradient(135deg, #003366 0%, #e53e3e 100%);
                }
                
                .hover-border-primary:hover {
                    border-color: #003366 !important;
                    box-shadow: 0 4px 12px rgba(0, 51, 102, 0.12);
                    transform: translateY(-2px);
                }
                
                .transition-2 { 
                    transition: all 0.3s ease-in-out; 
                }
                
                .avatar-xl { 
                    width: 100px; 
                    height: 100px; 
                }
                
                .g-24 { 
                    gap: 24px !important; 
                }
                
                .p-32 { 
                    padding: 32px; 
                }
                
                .px-20 { 
                    padding-left: 20px; 
                    padding-right: 20px; 
                }
                
                .py-10 { 
                    padding-top: 10px; 
                    padding-bottom: 10px; 
                }
                
                .mb-24 { 
                    margin-bottom: 24px; 
                }
            `}</style>
        </div>
    );
};

export default AdminUserViewLayer;