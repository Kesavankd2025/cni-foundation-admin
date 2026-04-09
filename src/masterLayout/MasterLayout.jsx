import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { IMAGE_BASE_URL } from "../Config/Index";
import LoginApi from "../Api/LoginApi";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [permissions, setPermissions] = useState([]);
  const [userType, setUserType] = useState("ADMIN");
  const [userData, setUserData] = useState({ name: "Administrator", role: { name: "Admin" } });

  useEffect(() => {
    // Disabled fetching permissions from backend
  }, []);

  const hasPermission = (moduleName, action = "view") => {
    return true; // Always return true
  };
  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px";
        }
      });
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`;
        }
      }
    };
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link",
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          const path = link.getAttribute("href") || link.getAttribute("to");
          if (
            (path &&
              (location.pathname === path ||
                location.pathname.startsWith(path + "/"))) ||
            link.classList.contains("active-page")
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            }
          }
        });
      });

      setTimeout(() => {
        const activeLink = document.querySelector(".sidebar-menu .active-page");
        if (activeLink && sidebarRef.current) {
          activeLink.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 300);
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname, permissions]); // Added permissions to dependency to re-run when updated

  useEffect(() => {
    // Restore scroll position
    const savedScrollPos = sessionStorage.getItem("sidebarScroll");
    if (savedScrollPos && sidebarRef.current) {
      sidebarRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }

    const handleScroll = () => {
      if (sidebarRef.current) {
        sessionStorage.setItem("sidebarScroll", sidebarRef.current.scrollTop);
      }
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  useEffect(() => {
    if (permissions.length > 0) {
      const routesMap = [
        { path: "/user-roles", perm: "Roles & Permissions" },
        { path: "/admin-registration", perm: "Admin Registration" },
        { path: "/media-category-list", perm: "Media Category" },
        { path: "/leadership-role-list", perm: "Leadership Role" },
        { path: "/members-registration", perm: "Members Registration" },
        { path: "/region", perm: "Region" },
        { path: "/badge", perm: "Badge Creation" },
        { path: "/award", perm: "Award" },
        { path: "/business-category", perm: "Business Category" },
        { path: "/points", perm: "Points" },
        { path: "/vertical-directors", perm: "Vertical Directors" },
        { path: "/chapter-creation", perm: "Chapter Creation" },
        { path: "/meeting-creation", perm: "Meeting Creation" },
        { path: "/attendance-report", perm: "Attendance List" },
        { path: "/community-update", perm: "Community Update" },
        { path: "/star-update", perm: "CNI Projects" },
        { path: "/mobile-ads", perm: "Mobile Banner Ads" },
        { path: "/training", perm: "Training" },
        { path: "/shop-category-list", perm: "Category List" },
        { path: "/shop-create", perm: "Create Product" },
        { path: "/shop-list", perm: "Place Order" },
        { path: "/orders", perm: "Orders List" },
        { path: "/log-report", perm: "Log Report" },
        { path: "/renewal-report", perm: "Renewal Report" },
        { path: "/chapter-report", perm: "Chapter Report" },
        { path: "/note-121", perm: "121's Report" },
        { path: "/referral-report", perm: "Referral's Report" },
        { path: "/visitors-report", perm: "Visitor's Report" },
        { path: "/absent-proxy-report", perm: "Absent & Proxy Report" },
        { path: "/performance-report", perm: "Performance Report" },
        { path: "/chief-guest-report", perm: "Chief Guest's Report" },
        { path: "/thank-you-slip-report", perm: "Thank you Slip Report" },
        { path: "/power-date", perm: "Power Meet" },
        { path: "/trainings-report", perm: "Training's Report" },
        { path: "/chapter-member-list", perm: "Member's List" },
        { path: "/testimonials-report", perm: "Testimonials Report" },
        { path: "/member-points-report", perm: "Member Points Report" },
        { path: "/member-suggestion-report", perm: "Member Suggestions" },
        { path: "/chief-guest-list", perm: "Chief Guest List" },
        { path: "/location-list", perm: "Locations" },
        { path: "/website-event-list", perm: "Event" },
        { path: "/member-enquiry", perm: "Member Enquiry" },
        { path: "/franchise-enquiry", perm: "Franchise Enquiry" },
        { path: "/blog-news-list", perm: "Blog" },
      ];

      // 1. Handle Dashboard Redirection
      if (location.pathname === "/") {
        if (userType !== "ADMIN" && !hasPermission("Dashboard")) {
          for (const route of routesMap) {
            if (hasPermission(route.perm)) {
              navigate(route.path);
              return;
            }
          }
        }
      }

      // 2. Handle Unauthorized Route Access
      if (userType !== "ADMIN") {
        const currentPath = location.pathname;

        // Find if current path or its parent path matches a protected route
        const matchedRoute = routesMap.find(route =>
          currentPath === route.path || currentPath.startsWith(route.path + "/")
        );

        if (matchedRoute && !hasPermission(matchedRoute.perm)) {
          navigate("/access-denied");
        } else if (currentPath === "/" && !hasPermission("Dashboard")) {
          // Dashboard already handled above, but as a fallback
        }
      }
    }
  }, [permissions, location.pathname, userType]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
    .format(currentTime)
    .replace(/ /g, "-");

  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(currentTime);

  const formattedTime = `${dateStr} ${timeStr}`;

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type="button"
          className="sidebar-close-btn"
        >
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link to="/" className="sidebar-logo">
            <img
              src="/assets/images/logo1.png"
              alt="site logo"
              className="light-logo"
            />
            <img
              src="/assets/images/logo1.png"
              alt="site logo"
              className="dark-logo"
            />
            <img
              src="/assets/images/logo-icon.png"
              alt="site logo"
              className="logo-icon"
            />
          </Link>
        </div>
        <div className="sidebar-menu-area" ref={sidebarRef}>
          <ul className="sidebar-menu" id="sidebar-menu">
            {/* Dashboard */}
            {hasPermission("Dashboard") && (
              <li>
                <NavLink
                  to="/"
                  className={(navData) =>
                    navData.isActive ? "active-page" : ""
                  }
                >
                  <Icon
                    icon="solar:home-smile-angle-outline"
                    className="menu-icon"
                  />
                  <span>Dashboard</span>
                </NavLink>
              </li>
            )}

            {/* Master Creation */}
            {(hasPermission("Roles & Permissions") ||
              hasPermission("Admin Registration") ||
              hasPermission("Media Category") ||
              hasPermission("Leadership Role")) && (
                <li className="dropdown">
                  <Link to="#"
                    className={
                      location.pathname === "/user-roles" ||
                        location.pathname === "/admin-registration" ||
                        location.pathname.startsWith("/media-category-") ||
                        location.pathname.startsWith("/leadership-role-")
                        ? "active-page"
                        : ""
                    }
                  >
                    <i className="ri-folder-settings-line menu-icon" />
                    <span>Master Creation</span>
                  </Link>
                  <ul className="sidebar-submenu">
                    {/* {hasPermission("Roles & Permissions") && (
                      <li>
                        <NavLink
                          to="/user-roles"
                          className={(navData) =>
                            navData.isActive ? "active-page" : ""
                          }
                        >
                          <Icon icon="mdi:shield-check-outline" className="menu-icon" /> Roles & Permissions
                        </NavLink>
                      </li>
                    )}
                    {hasPermission("Admin Registration") && (
                      <li>
                        <NavLink
                          to="/admin-registration"
                          className={(navData) =>
                            navData.isActive ? "active-page" : ""
                          }
                        >
                          <Icon icon="mdi:account-cog-outline" className="menu-icon" /> Admin Registration
                        </NavLink>
                      </li>
                    )} */}
                    {(userType === "ADMIN" || hasPermission("Media Category")) && (
                      <li>
                        <NavLink
                          to="/media-category-list"
                          className={(navData) =>
                            navData.isActive || location.pathname.startsWith("/media-category-") ? "active-page" : ""
                          }
                        >
                          <Icon icon="mdi:folder-image" className="menu-icon" /> Media Category
                        </NavLink>
                      </li>
                    )}
                    {(userType === "ADMIN" || hasPermission("Leadership Role")) && (
                      <li>
                        <NavLink
                          to="/leadership-role-list"
                          className={(navData) =>
                            navData.isActive || location.pathname.startsWith("/leadership-role-") ? "active-page" : ""
                          }
                        >
                          <Icon icon="mdi:account-star-outline" className="menu-icon" /> Leadership Role
                        </NavLink>
                      </li>
                    )}
                  </ul>
                </li>
              )}

            {userType === "ADMIN" && (
              <>
                {/* <li className="sidebar-menu-group-title">Website Management</li> */}
                <li>
                  <NavLink
                    to="/home-banner-list"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/home-banner-') ? "active-page" : ""}
                  >
                    <Icon icon="ri-image-line" className="menu-icon" /> Banners
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink
                    to="/events-media-list"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/events-media-') ? "active-page" : ""}
                  >
                    <Icon icon="ri-calendar-event-line" className="menu-icon" /> Events Media
                  </NavLink>
                </li> */}
                <li>
                  <NavLink
                    to="/blog-news-list"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/blog-news-') ? "active-page" : ""}
                  >
                    <Icon icon="ri-movie-line" className="menu-icon" /> Media Management
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/testimonials-list"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/testimonials-') ? "active-page" : ""}
                  >
                    <Icon icon="ri-chat-quote-line" className="menu-icon" /> Testimonials
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/leadership-team-list"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/leadership-team-') ? "active-page" : ""}
                  >
                    <Icon icon="ri-group-line" className="menu-icon" /> Leadership Team
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/volunteer-enquiry"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/volunteer-enquiry') ? "active-page" : ""}
                  >
                    <Icon icon="ri-user-heart-line" className="menu-icon" /> Volunteer Application
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/partnership-enquiry"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/partnership-enquiry') ? "active-page" : ""}
                  >
                    <Icon icon="mdi:handshake" className="menu-icon" /> Partnership Enquiry
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/internship-enquiry"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/internship-enquiry') ? "active-page" : ""}
                  >
                    <Icon icon="ri-book-open-line" className="menu-icon" /> Internship Application
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/gallery-list"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/gallery-') ? "active-page" : ""}
                  >
                    <Icon icon="ri-gallery-line" className="menu-icon" /> Gallery
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact-enquiry"
                    className={(navData) => navData.isActive || location.pathname.startsWith('/contact-enquiry') ? "active-page" : ""}
                  >
                    <Icon icon="ri-contacts-book-2-line" className="menu-icon" /> Contact Form
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </aside >

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active "
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type="button"
                  className="sidebar-mobile-toggle"
                >
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <span
                  style={{
                    color: "#003366",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {formattedTime}
                </span>
                {/* <ThemeToggleButton /> */}
                <div className="dropdown d-none d-sm-inline-block">
                  {/* <button
                    className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <Icon
                      icon="iconoir:bell"
                      className="text-primary-light text-xl"
                    />
                  </button> */}
                  <div className="dropdown-menu to-top dropdown-menu-lg p-0">
                    <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">
                          Notifications
                        </h6>
                      </div>
                      <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                        05
                      </span>
                    </div>
                    <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <Icon
                              icon="bitcoin-icons:verify-outline"
                              className="icon text-xxl"
                            />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Congratulations
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Your profile has been Verified. Your profile has
                              been Verified
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <img
                              src="/assets/images/notification/profile-1.png"
                              alt=""
                            />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Ronald Richards
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              You can stitch between artboards
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            AM
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Arlene McCoy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <img
                              src="/assets/images/notification/profile-2.png"
                              alt=""
                            />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Annette Black
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            DR
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Darlene Robertson
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                    </div>
                    <div className="text-center py-12 px-16">
                      <Link
                        to="#"
                        className="text-primary-600 fw-semibold text-md hover-text-primary d-flex justify-content-center align-items-center gap-2"
                      >
                        See All Notifications
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="icon"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Notification dropdown end */}

                <div className="dropdown">
                  <button
                    className="d-flex justify-content-center align-items-center rounded-circle border-0 p-0"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    {userData?.profileImage ? (
                      <img
                        src={`${IMAGE_BASE_URL}/${userData.profileImage?.path || userData.profileImage}`}
                        alt="image"
                        className="w-40-px h-40-px object-fit-cover rounded-circle"
                      />
                    ) : (
                      <div
                        className="w-40-px h-40-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center fw-bold"
                        style={{ fontSize: '18px' }}
                      >
                        {userData?.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-sm p-0">
                    <div className="p-16 px-24 border-bottom">
                      <h6 className="text-lg fw-semibold text-primary-light mb-0">
                        {userData?.name || "Administrator"}
                      </h6>
                      <span className="text-secondary-light text-sm">
                        {userData?.roleId?.name || userData?.role?.name || "Admin"}
                      </span>
                    </div>
                    <ul className="p-16">
                      {/* <li>
                        <Link
                          to="/my-profile"
                          className="d-flex align-items-center gap-3 hover-bg-primary-50 text-secondary-light radius-8 px-12 py-12"
                        >
                          <Icon
                            icon="solar:user-circle-outline"
                            className="icon text-xl"
                          />
                          My Profile
                        </Link>
                      </li> */}
                      <li>
                        <button
                          onClick={() => {
                            if (
                              window.confirm("Are you sure you want to logout?")
                            ) {
                              localStorage.clear();
                              window.location.href = "/sign-in";
                            }
                          }}
                          className="d-flex align-items-center gap-3 hover-bg-primary-50 text-secondary-light radius-8 px-12 py-12 border-0 bg-transparent w-100"
                        >
                          <Icon
                            icon="solar:logout-2-outline"
                            className="icon text-xl"
                          />
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className="dashboard-main-body">{children}</div>

        {/* Footer section */}
        <footer className="d-footer">
          <div className="row align-items-center">
            <div className="col-12 d-flex justify-content-between">

              {/* Left Side */}
              <p className="mb-0 text-start">
                © {new Date().getFullYear()}{" "}
                <span className="text-primary-600">CNI.</span> All Rights Reserved.
              </p>

              {/* Right Side */}
              <p className="mb-0 text-end">
                Developed & Maintained By{" "}
                <span className="text-primary-600">Ocean Softwares</span>
              </p>

            </div>
          </div>
        </footer>
      </main>
    </section >
  );
};

export default MasterLayout;
