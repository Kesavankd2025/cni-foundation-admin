import React, { useState, useEffect } from "react";
import DashboardApi from "../../Api/DashboardApi";

const UnitCountSix = () => {
  const [stats, setStats] = useState({
    zoneCount: 0,
    regionCount: 0,
    chapterCount: 0,
    visitorCount: 0,
    edCount: 0,
    rdCount: 0,
    memberCount: 0,
    goldClubCount: 0,
    diamondClubCount: 0,
    platinumClubCount: 0,
    primeChapterCount: 0,
    eliteChapterCount: 0,
  });

  const [activities, setActivities] = useState({
    oneToOneCount: 0,
    referralCount: 0,
    thankYouSlipAmount: 0,
    trainingCount: 0,
    powerDateCount: 0,
    testimonialsCount: 0,
    chiefGuestCount: 0,
    starUpdateCount: 0,
    starBusinessClosed: 0,
  });

  const [starAchievements, setStarAchievements] = useState({
    chiefGuestCount: 0,
    trainingCount: 0,
    starUpdateCount: 0,
    nextRenewalCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes, achievementsRes] = await Promise.all([
          DashboardApi.getDashboardStats(),
          DashboardApi.getDashboardActivities(),
          DashboardApi.getStarAchievements(),
        ]);

        if (statsRes.status) setStats(statsRes.response.data);
        if (activitiesRes.status) setActivities(activitiesRes.response.data);
        if (achievementsRes.status)
          setStarAchievements(achievementsRes.response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const masterStats = [
    {
      label: "User Roles",
      value: stats.roleCount || 0,
      icon: "ri-shield-user-line",
    },
    {
      label: "Admin Users",
      value: stats.adminCount || 0,
      icon: "ri-user-settings-line",
    },
    {
      label: "Media Categories",
      value: stats.mediaCategoryCount || 0,
      icon: "ri-folder-image-line",
    },
    {
      label: "Leadership Roles",
      value: stats.leadershipRoleCount || 0,
      icon: "ri-award-line",
    },
  ];

  const teamStats = [
    {
      label: "Leadership Team",
      value: stats.leadershipTeamCount || 0,
      icon: "ri-group-line",
    },
  ];

  const enquiryStats = [
    {
      label: "Volunteer Apps",
      value: stats.volunteerCount || 0,
      icon: "ri-user-heart-line",
    },
    {
      label: "Partnership Enquiries",
      value: stats.partnershipCount || 0,
      icon: "ri-handshake-line",
    },
    {
      label: "Internship Apps",
      value: stats.internshipCount || 0,
      icon: "ri-book-open-line",
    },
    {
      label: "Contact Forms",
      value: stats.contactCount || 0,
      icon: "ri-contacts-book-2-line",
    },
  ];

  const mediaStats = [
    {
      label: "Banners",
      value: stats.bannerCount || 0,
      icon: "ri-image-line",
    },
    {
      label: "Public Blogs",
      value: stats.blogCount || 0,
      icon: "ri-article-line",
    },
    {
      label: "Gallery Items",
      value: stats.galleryCount || 0,
      icon: "ri-gallery-line",
    },
    {
      label: "Testimonials",
      value: stats.testimonialCount || 0,
      icon: "ri-chat-quote-line",
    },
  ];

  const UnitCard = ({ item }) => (
    <div className="col">
      <div
        className={`card h-100 py-1 shadow-hover-xl transition-2 radius-20 hover-border-primary cursor-pointer`}
        style={{
          border: "1px solid #e5e7eb",
          borderRight: `3px solid #003366`,
          paddingLeft: `10px`,
        }}
      >
        <div className="card-body p-0">
          <div className="gap-2">
            <div className="flex-grow-1">
              <span className="fw-medium text-secondary-light text-sm mb-1 d-block text-uppercase spacing-1">
                {item.label}
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between gap-2">
              <h6 className="fw-bolder text-1xl mb-0">
                {item.value.toLocaleString("en-IN")}
              </h6>
              <span
                className={`w-48-px h-48-px d-flex justify-content-center align-items-center text-1xl`}
              >
                <i className={item.icon} style={{ color: "#003366" }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* Master Statistics */}
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Master Creation Overview</h6>
        </div>
        <div className="card-body p-24">
          <div className="row gy-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5">
            {masterStats.map((item, index) => (
              <UnitCard item={item} key={`mst-${index}`} />
            ))}
            {teamStats.map((item, index) => (
              <UnitCard item={item} key={`team-${index}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Website Enquiries */}
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Website Enquiries</h6>
        </div>
        <div className="card-body p-24">
          <div className="row gy-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4">
            {enquiryStats.map((item, index) => (
              <UnitCard item={item} key={`enq-${index}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Website Content */}
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Website Content</h6>
        </div>
        <div className="card-body p-24">
          <div className="row gy-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4">
            {mediaStats.map((item, index) => (
              <UnitCard item={item} key={`med-${index}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitCountSix;
