import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import AttendanceListLayer from "../components/AttendanceListLayer";

const AttendanceListPage = () => {
  return (
    <>
      <MasterLayout>
        <AttendanceListLayer />
      </MasterLayout>
    </>
  );
};

export default AttendanceListPage;
