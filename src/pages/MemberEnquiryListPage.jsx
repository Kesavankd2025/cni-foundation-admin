import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
// import Breadcrumb from '../components/Breadcrumb';
import MemberEnquiryListLayer from '../components/MemberEnquiryListLayer';

const MemberEnquiryListPage = () => {
    return (
        <MasterLayout>
            {/* <Breadcrumb title="Member Enquiry" /> */}
            <MemberEnquiryListLayer />
        </MasterLayout>
    );
};

export default MemberEnquiryListPage;
