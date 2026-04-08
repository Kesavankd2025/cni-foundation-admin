import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State } from "country-state-city";
import { selectStyles } from "../helper/SelectStyles";
import ZoneApi from "../Api/ZoneApi";
import usePermissions from "../hook/usePermissions";

const ZoneFormLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    name: "",
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.country) {
      errors.country = "Country is Required";
      isValid = false;
    }
    if (!formData.state) {
      errors.state = "State is Required";
      isValid = false;
    }
    if (!formData.name) {
      errors.name = "Zone Name is Required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name,
      country: formData.country,
      state: formData.state,
    };

    const response = await ZoneApi.createZone(payload);
    if (response && response.status) {
      navigate("/region/add");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">Create Zone</h6>
        <div className="d-flex gap-2">
          <Link
            to="/region/add"
            className="btn btn-outline-secondary btn-sm"
          >
            Back to Region
          </Link>
        </div>
      </div>

      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-12">
              <div className="row">
                <div className="mb-4 col-md-6">
                  <label className="form-label fw-medium">
                    Country <span className="text-danger-600">*</span>
                  </label>
                  <Select
                    options={Country.getAllCountries().map((country) => ({
                      value: country.isoCode,
                      label: country.name,
                    }))}
                    value={selectedCountry}
                    onChange={(selectedOption) => {
                      setSelectedCountry(selectedOption);
                      setSelectedState(null);
                      setFormData({
                        ...formData,
                        country: selectedOption ? selectedOption.label : "",
                        state: "",
                      });
                      if (formErrors.country)
                        setFormErrors({ ...formErrors, country: "" });
                    }}
                    placeholder="Select Country"
                    styles={selectStyles(formErrors.country)}
                  />
                  {formErrors.country && (
                    <div className="text-danger mt-1 fontsize-14">
                      {formErrors.country}
                    </div>
                  )}
                </div>

                <div className="mb-4 col-md-6">
                  <label className="form-label fw-medium">
                    State <span className="text-danger-600">*</span>
                  </label>
                  <Select
                    options={
                      formData.country
                        ? State.getStatesOfCountry(
                          Country.getAllCountries().find(
                            (c) => c.name === formData.country,
                          )?.isoCode,
                        ).map((state) => ({
                          value: state.isoCode,
                          label: state.name,
                        }))
                        : []
                    }
                    value={selectedState}
                    onChange={(selectedOption) => {
                      setSelectedState(selectedOption);
                      setFormData({
                        ...formData,
                        state: selectedOption ? selectedOption.label : "",
                      });
                      if (formErrors.state) {
                        setFormErrors({ ...formErrors, state: "" });
                      }
                    }}
                    placeholder="Select State"
                    isDisabled={!formData.country}
                    styles={selectStyles(formErrors.state)}
                  />
                  {formErrors.state && (
                    <div className="text-danger mt-1 fontsize-14">
                      {formErrors.state}
                    </div>
                  )}
                </div>

                <div className="mb-4 col-md-6">
                  <label className="form-label fw-medium">
                    Zone Name <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter Zone Name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {formErrors.name && (
                    <div className="text-danger mt-1 fontsize-14">
                      {formErrors.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Link
                  to="/region/add"
                  className="btn btn-outline-secondary px-32 justify-content-center"
                  style={{ width: "120px" }}
                >
                  Cancel
                </Link>
                {hasPermission("Zone Creation", "add") && (
                  <button
                    type="submit"
                    className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                    style={{ width: "120px" }}
                  >
                    <i className="fas fa-save me-2"></i>Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div >
    </div >
  );
};

export default ZoneFormLayer;
