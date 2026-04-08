import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import BusinessCategoryListLayer from "../components/BusinessCategoryListLayer";

const BusinessCategoryListPage = () => {
  return (
    <>
      <MasterLayout>
        <BusinessCategoryListLayer />
      </MasterLayout>
    </>
  );
};

export default BusinessCategoryListPage;
