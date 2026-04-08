import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import MemberListLayer from "../components/MemberListLayer";

const MemberListPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>

        <MemberListLayer />
      </MasterLayout>
    </>
  );
};

export default MemberListPage;
