import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import TablePagination from "./TablePagination";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";

const GeneralUpdateFormLayer = () => {
  const [updates, setUpdates] = useState([
    {
      id: 1,
      image: "assets/images/user-list/user-list1.png",
      from: "Admin User",
      to: "All Members",
      description: "Monthly forum meeting announcement for January.",
      location: "Main Hall, Chennai",
      dateTime: "12 Jan 2026, 10:00 AM",
    },
    {
      id: 2,
      image: "assets/images/user-list/user-list2.png",
      from: "System Admin",
      to: "Chapter Leaders",
      description: "Update on new membership guidelines and portal changes.",
      location: "Online (Zoom)",
      dateTime: "13 Jan 2026, 03:30 PM",
    },
    {
      id: 3,
      image: "assets/images/user-list/user-list3.png",
      from: "Event Coordinator",
      to: "CNI Members",
      description: "Annual gala dinner invitation and registration details.",
      location: "Grand Ballroom, Madurai",
      dateTime: "15 Jan 2026, 07:00 PM",
    },
    {
      id: 4,
      image: "assets/images/user-list/user-list4.png",
      from: "Regional Director",
      to: "Coimbatore Chapter",
      description: "Chapter-specific achievement awards and recognition.",
      location: "Cosmopolitan Club",
      dateTime: "18 Jan 2026, 11:00 AM",
    },
    {
      id: 5,
      image: "assets/images/user-list/user-list5.png",
      from: "Tech Support",
      to: "All Users",
      description: "Scheduled maintenance of the forum mobile app.",
      location: "Platform-wide",
      dateTime: "20 Jan 2026, 12:00 AM",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalRecords = filteredUpdates.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const currentData = filteredUpdates.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSelectChange = (selectedOption) => {
    setRowsPerPage(selectedOption.value);
    setCurrentPage(1);
  };

  const rowsOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
  ];

  const getSelectedOption = (options, value) => {
    return options.find((option) => option.value === value) || options[0];
  };


  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">General Update</h6>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <span className="text-md fw-medium text-secondary-light mb-0">
            Show
          </span>
          <Select
            value={getSelectedOption(rowsOptions, rowsPerPage)}
            onChange={handleSelectChange}
            options={rowsOptions}
            styles={selectStyles()}
            isSearchable={false}
            isClearable={false}
            menuPlacement="auto"
          />
          <form className="navbar-search">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              name="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Icon icon="ion:search-outline" className="icon" />
          </form>
        </div>
        {/* <Link
                    to="/general-update"
                    className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                    
                >
                    <Icon
                        icon="ic:baseline-plus"
                        className="icon text-xl line-height-1"
                    />
                    Add Update
                </Link> */}
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Uploaded Image</th>
                <th scope="col">From</th>
                <th scope="col">To</th>
                <th scope="col">Description</th>
                <th scope="col">Location</th>
                <th scope="col">Date and Time</th>
                <th scope="col" className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((update, index) => (
                  <tr key={update.id}>
                    <td>
                      {String(
                        (currentPage - 1) * rowsPerPage + index + 1,
                      ).padStart(2, "0")}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={update.image}
                          alt=""
                          className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/40x40?text=IMG";
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {update.from}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {update.to}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {update.description}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {update.location}
                      </span>
                    </td>
                    <td>
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {update.dateTime}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-10 justify-content-center">
                        <button
                          type="button"
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon
                            icon="majesticons:eye-line"
                            className="icon text-xl"
                          />
                        </button>
                        {/* <button
                                                    type="button"
                                                    className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                >
                                                    <Icon icon="lucide:edit" className="menu-icon" />
                                                </button> */}
                        <button
                          type="button"
                          className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon
                            icon="fluent:delete-24-regular"
                            className="menu-icon"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No updates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
};

export default GeneralUpdateFormLayer;
