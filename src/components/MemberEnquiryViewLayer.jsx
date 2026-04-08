import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MemberEnquiryApi from '../Api/MemberEnquiryApi';

const MemberEnquiryViewLayer = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (enquiryId) => {
        try {
            setLoading(true);
            const response = await MemberEnquiryApi.getMemberEnquiryById(enquiryId);
            if (response && response.status && response.response.data) {
                setData(response.response.data);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
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

    if (!data) {
        return (
            <div className="card h-100 p-24 text-center radius-12 border-0 shadow-sm bg-base">
                <h5 className="text-secondary-light">Member Enquiry details not found.</h5>
                <Link to="/member-enquiry" className="btn btn-secondary w-fit-content mx-auto mt-16 radius-8">
                    Back to List
                </Link>
            </div>
        );
    }

    const sections = [
        {
            title: "Personal Details",
            fields: [
                { label: "Full Name", value: data.name },
                { label: "Date of Birth", value: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "-" },
                { label: "Anniversary", value: data.anniversary ? new Date(data.anniversary).toLocaleDateString() : "-" },
                { label: "Email ID", value: data.emailId },
                { label: "Mobile Number", value: data.mobileNo },
                { label: "Passport Photo URL", value: data.passportPhotoUrl }
            ]
        },
        {
            title: "Business Details",
            fields: [
                { label: "Company Name", value: data.companyName },
                { label: "Position in Company", value: data.positionInCompany },
                { label: "Category", value: data.category },
                { label: "Website", value: data.website },
                { label: "Years of Experience in Business", value: data.yearsOfExperienceInBusiness }
            ]
        },
        {
            title: "Address",
            fields: [
                { label: "Door No (New No)", value: data.officeAddress?.doorNoNewNo },
                { label: "Old No", value: data.officeAddress?.oldNo },
                { label: "Street", value: data.officeAddress?.street },
                { label: "Area", value: data.officeAddress?.area },
                { label: "City", value: data.officeAddress?.city },
                { label: "State", value: data.officeAddress?.state },
                { label: "Pincode", value: data.officeAddress?.pincode }
            ]
        },
        {
            title: "Application & Chapter Details",
            fields: [
                { label: "Application No", value: data.applicationNo },
                { label: "Date of Joining", value: data.dateOfJoining ? new Date(data.dateOfJoining).toLocaleDateString() : "-" },
                { label: "Chapter Name", value: data.chapterName },
                { label: "Location", value: data.location },
                { label: "Region Name", value: data.regionName },
                { label: "Referred By", value: data.referredBy }
            ]
        },
        {
            title: "Payment Details",
            fields: [
                { label: "Annual Membership Fee", value: data.annualMembershipFee },
                { label: "Payment Mode", value: data.paymentMode },
                { label: "Payment Date", value: data.paymentDate ? new Date(data.paymentDate).toLocaleDateString() : "-" },
                { label: "Transaction ID", value: data.transactionId },
                { label: "GST No", value: data.gstNo },
                { label: "PAN No", value: data.panNo }
            ]
        }
    ];

    return (
        <div className="container-fluid px-0">
            {/* Header Section */}
            <div className="card border-0 shadow-sm radius-12 mb-24 bg-base">
                <div className="card-body p-24">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h6 className="text-primary-600 pb-2 mb-0">Member Enquiry Details</h6>
                        </div>
                        <Link to="/member-enquiry" className="btn btn-outline-secondary btn-md d-flex align-items-center gap-2 radius-8 px-20">
                            <Icon icon="solar:arrow-left-bold" /> Back to List
                        </Link>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Image overview if passportPhoto is available */}
                {data.passportPhotoUrl && (
                    <div className="col-12 mb-24">
                        <div className="card border-0 shadow-sm radius-12 overflow-hidden bg-base">
                            <div className="card-body p-24 d-flex align-items-center gap-4">
                                <img src={data.passportPhotoUrl} alt="Passport Photo" className="img-thumbnail" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                                <div>
                                    <h5 className="fw-bold mb-1">{data.name}</h5>
                                    <p className="text-secondary-light mb-0">{data.companyName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="col-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="card border-0 shadow-sm radius-12 bg-base mb-24">
                            <div className="card-header bg-transparent border-bottom border-neutral-100 p-24">
                                <h6 className="fw-bold mb-0 text-dark">{section.title}</h6>
                            </div>
                            <div className="card-body p-24">
                                <div className="row g-4">
                                    {section.fields.map((field, fieldIdx) => (
                                        <div key={fieldIdx} className="col-md-6 col-lg-4">
                                            <div className="info-box p-20 border border-neutral-100 radius-8 bg-white h-100">
                                                <p className="text-secondary-light small mb-2 fw-semibold text-uppercase">{field.label}</p>
                                                {field.label === "Passport Photo URL" ? (
                                                    <a href={field.value} target="_blank" rel="noreferrer" className="fw-bold mb-0 text-primary-600 fs-6 text-break">View Photo</a>
                                                ) : (
                                                    <p className="fw-bold mb-0 text-dark fs-6 text-break">{field.value || "-"}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .text-primary-600 { color: #003366 !important; }
            `}</style>
        </div>
    );
};

export default MemberEnquiryViewLayer;
