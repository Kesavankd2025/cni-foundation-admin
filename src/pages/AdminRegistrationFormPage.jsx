import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import AdminUserFormLayer from "../components/AdminUserFormLayer";

const AdminRegistrationFormPage = () => {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* AdminUserFormLayer */}
                <AdminUserFormLayer />
            </MasterLayout>
        </>
    );
};

export default AdminRegistrationFormPage;
