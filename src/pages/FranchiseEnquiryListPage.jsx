import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
// import Breadcrumb from '../components/Breadcrumb';
import FranchiseEnquiryListLayer from '../components/FranchiseEnquiryListLayer';

const FranchiseEnquiryListPage = () => {
    return (
        <MasterLayout>
            {/* <Breadcrumb title="Franchise Enquiry" /> */}
            <FranchiseEnquiryListLayer />
        </MasterLayout>
    );
};

export default FranchiseEnquiryListPage;
