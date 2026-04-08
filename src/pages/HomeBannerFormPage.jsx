
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
// import Breadcrumb from "../components/Breadcrumb";
import Layer from "../components/HomeBannerFormLayer";

const HomeBannerFormPage = () => {
  return (
    <>
      <MasterLayout>
        {/* <Breadcrumb title="Home Page Banner Management" /> */}
        <Layer />
      </MasterLayout>
    </>
  );
};
export default HomeBannerFormPage;
