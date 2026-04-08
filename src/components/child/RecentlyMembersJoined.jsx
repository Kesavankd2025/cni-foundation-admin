import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardApi from "../../Api/DashboardApi";
import { IMAGE_BASE_URL } from "../../Config/Index";
import { Icon } from "@iconify/react/dist/iconify.js";

const RecentlyMembersJoined = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await DashboardApi.getRecentlyJoinedMembers();
      if (response.status && response.response.data) {
        setMembers(response.response.data);
      }
    } catch (error) {
      console.error("Error fetching recently joined members:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-xxl-12">
      <div className="card h-100">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
          <h6 className="text-lg fw-semibold mb-0">Recently Joined Members</h6>
          <Link
            to="/chapter-member-list"
            className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
          >
            View All
            <Icon icon="solar:alt-arrow-right-linear" className="icon" />
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scroll-sm">
            <table
              className="table bordered-table mb-0 rounded-0 border-0"
              style={{ color: "white" }}
            >
              <thead style={{ backgroundColor: "#003366", color: "white" }}>
                <tr>
                  <th
                    scope="col"
                    className="bg-transparent rounded-0 text-white"
                    style={{ color: "white" }}
                  >
                    S.No
                  </th>
                  <th
                    scope="col"
                    className="bg-transparent rounded-0 text-white"
                    style={{ color: "white" }}
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="bg-transparent rounded-0 text-white"
                    style={{ color: "white" }}
                  >
                    Category
                  </th>
                  <th scope="col" className="bg-transparent rounded-0">
                    Company
                  </th>
                  {/* <th scope="col" className="bg-transparent rounded-0">
                    Location
                  </th> */}
                  <th scope="col" className="bg-transparent rounded-0">
                    Region
                  </th>
                  <th scope="col" className="bg-transparent rounded-0">
                    Chapter
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : members.length > 0 ? (
                  members.map((member, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {member?.profileImage?.path ? (
                            <img
                              src={`${IMAGE_BASE_URL}/${member.profileImage.path}`}
                              alt="profile"
                              className="w-32-px h-32-px rounded-circle object-fit-cover"
                              onError={(e) => {
                                const name = member.name || "S";
                                const initial = name.charAt(0).toUpperCase();
                                e.currentTarget.outerHTML = `<div class="w-32-px h-32-px rounded-circle bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-sm">${initial}</div>`;
                              }}
                            />
                          ) : (
                            <div className="w-32-px h-32-px rounded-circle bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-sm">
                              {member.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                          )}
                          {member.name}
                        </div>
                      </td>
                      <td>{member.category}</td>
                      <td>{member.company}</td>
                      {/* <td>{member.location || "-"}</td> */}
                      <td>{member.region}</td>
                      <td>{member.chapter}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No recently joined members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyMembersJoined;
