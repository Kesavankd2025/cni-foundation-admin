
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
// import Breadcrumb from "../components/Breadcrumb";
import Layer from "../components/ContactEnquiryListLayer";

const ContactEnquiryListPage = () => {
  return (
    <>
      <MasterLayout>
        {/* <Breadcrumb title="Contact Form Enquiries" /> */}
        <Layer />
      </MasterLayout>
    </>
  );
};
export default ContactEnquiryListPage;
