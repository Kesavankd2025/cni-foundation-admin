
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
// import Breadcrumb from "../components/Breadcrumb";
import Layer from "../components/EventsMediaListLayer";

const EventsMediaListPage = () => {
  return (
    <>
      <MasterLayout>
        {/* <Breadcrumb title="Events, Press Releases & Media" /> */}
        <Layer />
      </MasterLayout>
    </>
  );
};
export default EventsMediaListPage;
