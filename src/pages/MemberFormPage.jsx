import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import MemberFormLayer from "../components/MemberFormLayer";
import { useParams } from "react-router-dom";

const MemberFormPage = () => {
  const { id } = useParams();
  const title = id ? "Edit Member Registration" : "Member Registration";
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>


        {/* MemberFormLayer */}
        <MemberFormLayer />
      </MasterLayout>
    </>
  );
};

export default MemberFormPage;
