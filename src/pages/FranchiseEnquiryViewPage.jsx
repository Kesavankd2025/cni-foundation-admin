import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
// import Breadcrumb from '../components/Breadcrumb';
import FranchiseEnquiryViewLayer from '../components/FranchiseEnquiryViewLayer';

const FranchiseEnquiryViewPage = () => {
    return (
        <MasterLayout>
            {/* <Breadcrumb title="View Franchise Enquiry" /> */}
            <FranchiseEnquiryViewLayer />
        </MasterLayout>
    );
};

export default FranchiseEnquiryViewPage;
