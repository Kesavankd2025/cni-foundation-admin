import React from "react";
import { Link } from "react-router-dom";

const TopPerformanceList = ({ title, data, valuePrefix = "", linkTo = "#" }) => {
  return (
    <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
      <div className="card h-100">
        <div className="card-header border-bottom">
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
            <h6 className="mb-2 fw-bold text-lg mb-0">{title}</h6>
            <Link
              to={linkTo}
              className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
            >
              View All
              <iconify-icon
                icon="solar:alt-arrow-right-linear"
                className="icon"
              />
            </Link>
          </div>
        </div>
        <div className="card-body">
          <div className="d-flex flex-column gap-24">
            {data.map((item, index) => (
              <div
                className="d-flex align-items-center justify-content-between gap-3"
                key={index}
              >
                <div className="d-flex align-items-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                      onError={(e) => {
                        const name = item.name || "S";
                        const initial = name.charAt(0).toUpperCase();
                        e.target.outerHTML = `<div class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">${initial}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-lg">
                      {item.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <h6 className="text-md mb-0">{item.name}</h6>
                    {item.businessCategory && (
                      <span className="text-sm text-secondary-light">
                        {item.businessCategory}
                      </span>
                    )}
                  </div>
                </div>
                <span className="bg-success-focus text-success-main px-10 py-4 radius-8 fw-medium text-sm">
                  {valuePrefix}
                  {item.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformanceList;
