import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import ChapterListLayer from "../components/ChapterListLayer";

const ChapterListPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* ChapterListLayer */}
        <ChapterListLayer />
      </MasterLayout>
    </>
  );
};

export default ChapterListPage;
