import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import RenewalHistoryLayer from "../components/RenewalHistoryLayer";

const RenewalHistoryPage = () => {
    return (
        <MasterLayout>
            {/* <Breadcrumb title="Renewal Report / History" /> */}
            <RenewalHistoryLayer />
        </MasterLayout>
    );
};

export default RenewalHistoryPage;
