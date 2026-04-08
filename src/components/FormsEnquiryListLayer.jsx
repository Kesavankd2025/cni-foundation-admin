
import React from "react";

const FormsEnquiryListLayer = () => {
  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">Volunteer, Partner & Careers</h6>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Name</th>
                <th scope="col">Email/Phone</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="text-center py-4">No enquiries found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default FormsEnquiryListLayer;
