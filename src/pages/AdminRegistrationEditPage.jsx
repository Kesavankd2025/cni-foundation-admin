import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import AdminUserFormLayer from "../components/AdminUserFormLayer";

const AdminRegistrationEditPage = () => {
    // In a real app, we would fetch user data here based on ID and pass it to AdminUserFormLayer
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* AdminUserFormLayer - reused for edit */}
                <AdminUserFormLayer />
            </MasterLayout>
        </>
    );
};

export default AdminRegistrationEditPage;
