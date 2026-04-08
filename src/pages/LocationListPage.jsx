import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import LocationListLayer from "../components/LocationListLayer";

const LocationListPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* LocationListLayer */}
        <LocationListLayer />
      </MasterLayout>
    </>
  );
};

export default LocationListPage;
