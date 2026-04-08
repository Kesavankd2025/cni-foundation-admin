import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import MemberSuggestionListLayer from "../components/MemberSuggestionListLayer";

const MemberSuggestionPage = () => {
  return (
    <>
      <MasterLayout>
        <MemberSuggestionListLayer />
      </MasterLayout>
    </>
  );
};

export default MemberSuggestionPage;
