import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout";
import ChiefGuestFormLayer from "../components/ChiefGuestFormLayer";

const ChiefGuestFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  return (
    <>
      <MasterLayout>
        <ChiefGuestFormLayer />
      </MasterLayout>
    </>
  );
};

export default ChiefGuestFormPage;
