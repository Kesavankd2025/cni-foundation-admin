
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
// import Breadcrumb from "../components/Breadcrumb";
import Layer from "../components/GalleryFormLayer";

const GalleryFormPage = () => {
  return (
    <>
      <MasterLayout>
        {/* <Breadcrumb title="Photo & Video Gallery" /> */}
        <Layer />
      </MasterLayout>
    </>
  );
};
export default GalleryFormPage;
