
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const SuccessStoriesListLayer = () => {
  const [records, setRecords] = useState([]);
  
  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-primary-600 pb-2 mb-0">Success Stories & Impact</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <Link
            to="/success-stories-add"
            className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
            Add New
          </Link>
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ color: "black" }}>S.No</th>
                <th scope="col" style={{ color: "black" }}>Title/Name</th>
                <th scope="col" style={{ color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SuccessStoriesListLayer;
