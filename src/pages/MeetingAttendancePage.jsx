import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import MeetingAttendanceLayer from "../components/MeetingAttendanceLayer";

const MeetingAttendancePage = () => {
    return (
        <>
            <MasterLayout>
                <MeetingAttendanceLayer />
            </MasterLayout>
        </>
    );
};

export default MeetingAttendancePage;
