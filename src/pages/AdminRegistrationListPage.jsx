import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import AdminRegistrationListLayer from "../components/AdminRegistrationListLayer";

const AdminRegistrationListPage = () => {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                <AdminRegistrationListLayer />
            </MasterLayout>
        </>
    );
};

export default AdminRegistrationListPage;
