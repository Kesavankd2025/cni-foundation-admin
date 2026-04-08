import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import FormPageLayer from "../components/FormPageLayer";

const FormPage = ({ title }) => {
  return (
    <>
      <MasterLayout>
        {/* FormPageLayer */}
        <FormPageLayer title={title} />
      </MasterLayout>
    </>
  );
};

export default FormPage;
