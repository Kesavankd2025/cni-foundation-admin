import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FranchiseEnquiryApi from '../Api/FranchiseEnquiryApi';

const FranchiseEnquiryViewLayer = () => {
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
            const response = await FranchiseEnquiryApi.getFranchiseEnquiryById(enquiryId);
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
                <h5 className="text-secondary-light">Franchise Enquiry details not found.</h5>
                <Link to="/franchise-enquiry" className="btn btn-secondary w-fit-content mx-auto mt-16 radius-8">
                    Back to List
                </Link>
            </div>
        );
    }

    const sections = [
        {
            title: "Personal Information",
            fields: [
                { label: "Full Name", value: data.fullName },
                { label: "Date of Birth", value: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "-" },
                { label: "Gender", value: data.gender },
                { label: "Nationality", value: data.nationality },
                { label: "Contact Number", value: data.contactNumber },
                { label: "Email Address", value: data.emailAddress },
                { label: "Current Residential Address", value: data.currentResidentialAddress },
                { label: "Business Website", value: data.businessWebsite }
            ]
        },
        {
            title: "Business Experience",
            fields: [
                { label: "Current Occupation/Business", value: data.currentOccupationBusiness },
                { label: "Company Name (If Applicable)", value: data.companyNameIfApplicable },
                { label: "Number of Years in Business", value: data.numberOfYearsInBusiness },
                { label: "Number of Employees", value: data.numberOfEmployees },
                { label: "Educational Background", value: data.educationalBackground },
                { label: "Industry Experience", value: data.industryExperience }
            ]
        },
        {
            title: "Franchise Preferences",
            fields: [
                { label: "Proposed Location for Franchise", value: data.proposedLocationForFranchise },
                { label: "Investment Budget (Approx)", value: data.investmentBudgetApprox },
                { label: "Source of Investment", value: data.sourceOfInvestment },
                { label: "Reason for Interest in Franchise", value: data.reasonForInterestInFranchise },
                { label: "Any Previous Franchise Experience?", value: data.anyPreviousFranchiseExperience ? "Yes" : "No" },
                { label: "If Yes, Please Specify", value: data.ifYesPleaseSpecify }
            ]
        },
        {
            title: "Other Information",
            fields: [
                { label: "Are You A Member?", value: data.areYouAMember ? "Yes" : "No" },
                { label: "Member Name/ID (If Member)", value: data.memberNameIdIfMember },
                { label: "Reference Name", value: data.referenceName },
                { label: "Reference Contact", value: data.referenceContact },
                { label: "Type of Support Expected From Franchisor", value: data.typeOfSupportExpectedFromFranchisor },
                { label: "Are You Facing Any Legal Issues?", value: data.areYouFacingAnyLegalIssues ? "Yes" : "No" },
                { label: "Signature Name", value: data.signatureName },
                { label: "Declaration Date", value: data.declarationDate ? new Date(data.declarationDate).toLocaleDateString() : "-" }
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
                            <h6 className="text-primary-600 pb-2 mb-0">Franchise Enquiry Details</h6>
                        </div>
                        <Link to="/franchise-enquiry" className="btn btn-outline-secondary btn-md d-flex align-items-center gap-2 radius-8 px-20">
                            <Icon icon="solar:arrow-left-bold" /> Back to List
                        </Link>
                    </div>
                </div>
            </div>

            <div className="row">
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
                                                <p className="fw-bold mb-0 text-dark fs-6 text-break">{field.value || "-"}</p>
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

export default FranchiseEnquiryViewLayer;
