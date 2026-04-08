import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import MyProfileLayer from "../components/MyProfileLayer";

const MyProfilePage = () => {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* MyProfileLayer */}
                <MyProfileLayer />
            </MasterLayout>
        </>
    );
};

export default MyProfilePage;
