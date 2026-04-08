import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import ChapterFormLayer from "../components/ChapterFormLayer";
import { useParams } from "react-router-dom";

const ChapterFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* ChapterFormLayer */}
        <ChapterFormLayer />
      </MasterLayout>
    </>
  );
};

export default ChapterFormPage;
