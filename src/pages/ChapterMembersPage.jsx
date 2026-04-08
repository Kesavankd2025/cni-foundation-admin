import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import ChapterMembersTableLayer from "../components/ChapterMembersTableLayer";

const ChapterMembersPage = () => {
    return (
        <MasterLayout>
            <div className="p-24 bg-neutral-50 min-vh-100">
                <ChapterMembersTableLayer />
            </div>
        </MasterLayout>
    );
};

export default ChapterMembersPage;
