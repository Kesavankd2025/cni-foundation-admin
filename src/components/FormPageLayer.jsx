import React from "react";

const FormPageLayer = ({ title }) => {
  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">{title}</h5>
          </div>
          <div className="card-body">
            <p className="text-secondary-light">Form content for {title} goes here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPageLayer;
