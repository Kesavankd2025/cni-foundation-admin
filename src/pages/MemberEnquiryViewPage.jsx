import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
// import Breadcrumb from '../components/Breadcrumb';/
import MemberEnquiryViewLayer from '../components/MemberEnquiryViewLayer';

const MemberEnquiryViewPage = () => {
    return (
        <MasterLayout>
            {/* <Breadcrumb title="View Member Enquiry" /> */}
            <MemberEnquiryViewLayer />
        </MasterLayout>
    );
};

export default MemberEnquiryViewPage;
