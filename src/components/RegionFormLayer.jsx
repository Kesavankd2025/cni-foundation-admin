import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import usePermissions from "../hook/usePermissions";
import { selectStyles } from "../helper/SelectStyles";
import { toast } from "react-toastify";
import { Country, State } from "country-state-city";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import { formatLabel, formatErrorMessage } from "../helper/TextHelper";

const RegionFormLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    zoneId: "",
    region: "",
    edId: "",
    rdIds: [],
  });

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [edOptions, setEdOptions] = useState([]);
  const [rdOptions, setRdOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [filteredZones, setFilteredZones] = useState([]);

  useEffect(() => {
    const init = async () => {
      const promises = [fetchEdUsers(), fetchRdUsers()];
      if (id) {
        promises.push(getRegionById(id));
      }
      await Promise.all(promises);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (formData.state) {
      fetchZones(formData.state);
    } else {
      setFilteredZones([]);
    }
  }, [formData.state]);

  const fetchZones = async (stateName) => {
    const response = await ZoneApi.getZoneByState(stateName);
    if (response && response.status && response.response.data) {
      setFilteredZones(response.response.data);
    }
  };

  const fetchEdUsers = async () => {
    const response = await RegionApi.getRoleBasedUser("ED");
    if (response && response.status && response.response.data) {
      const users = response.response.data;
      const options = users.map((user) => ({
        value: user._id,
        label: user.name,
      }));
      setEdOptions(options);
    }
  };
  const fetchRdUsers = async () => {
    const response = await RegionApi.getRoleBasedUser("RD");
    if (response && response.status && response.response.data) {
      const users = response.response.data;
      const options = users.map((user) => ({
        value: user._id,
        label: user.name,
      }));
      setRdOptions(options);
    }
  };

  const getRegionById = async (id) => {
    const response = await RegionApi.getRegionDetails(id);
    if (response && response.status && response.response.data) {
      const data = response.response.data;

      let normalizedRdIds = [];
      const rdData = data.rd || data.rdIds;

      if (Array.isArray(rdData)) {
        normalizedRdIds = rdData.map((r) =>
          typeof r === "object" ? r._id : r,
        );
      } else if (rdData) {
        normalizedRdIds = [typeof rdData === "object" ? rdData._id : rdData];
      }

      const normalizedData = {
        ...data,
        zoneId: data.zone?._id || data.zone || data.zoneId,
        edId: data.ed?._id || data.ed || data.edId,
        rdIds: normalizedRdIds,
      };
      setFormData(normalizedData);

      const countryObj = Country.getAllCountries().find(
        (c) => c.name === data.country,
      );
      if (countryObj) {
        setSelectedCountry({ value: countryObj.isoCode, label: data.country });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : "",
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleMultiSelectChange = (selectedOptions, { name }) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFormData({
      ...formData,
      [name]: values,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const getSelectedOption = (options, value) => {
    return options.find((option) => option.value === value) || null;
  };

  const getSelectedOptions = (options, values) => {
    if (!Array.isArray(values)) return [];
    return options.filter((option) => values.includes(option.value));
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.country) {
      errors.country = formatErrorMessage("country is Required");
      isValid = false;
    }
    if (!formData.state) {
      errors.state = formatErrorMessage("state is Required");
      isValid = false;
    }
    if (!formData.zoneId) {
      errors.zoneId = formatErrorMessage("zone is Required");
      isValid = false;
    }
    if (!formData.region) {
      errors.region = formatErrorMessage("region is Required");
      isValid = false;
    }
    if (!formData.rdIds || formData.rdIds.length === 0) {
      errors.rdIds = formatErrorMessage("RD name is Required");
      isValid = false;
    }
    if (!formData.edId) {
      errors.edId = formatErrorMessage("ED name is Required");
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
    if (id) {
      const payload = { ...formData, id };
      const response = await RegionApi.updateRegion(payload);
      if (response && response.status) {
        navigate("/region");
      }
    } else {
      const response = await RegionApi.createRegion(formData);
      if (response && response.status) {
        navigate("/region");
      }
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">
          {id ? "Edit" : "Create"} Region
        </h6>
        <div className="d-flex gap-2">
          {!id && (
            <Link to="/zone/add" className="btn btn-primary btn-sm">
              <Icon icon="ic:baseline-plus" className="text-xl me-1" />
              Add Zone
            </Link>
          )}
          <Link to="/region" className="btn btn-outline-secondary btn-sm">
            Back to List
          </Link>
        </div>
      </div>

      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
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
                  setFormData({
                    ...formData,
                    country: selectedOption ? selectedOption.label : "",
                    state: "",
                    zoneId: "",
                  });
                  if (formErrors.country) {
                    setFormErrors({ ...formErrors, country: "" });
                  }
                }}
                placeholder="Select Country"
                isClearable
                styles={selectStyles(formErrors.country)}
              />
              {formErrors.country && (
                <div className="text-danger mt-1 text-xs">
                  {formErrors.country}
                </div>
              )}
            </div>

            <div className="col-md-6">
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
                value={
                  formData.state
                    ? { value: formData.state, label: formData.state }
                    : null
                }
                onChange={(selectedOption) => {
                  setFormData({
                    ...formData,
                    state: selectedOption ? selectedOption.label : "",
                    zoneId: "",
                  });
                  if (formErrors.state) {
                    setFormErrors({ ...formErrors, state: "" });
                  }
                }}
                placeholder="Select State"
                isClearable
                isDisabled={!formData.country}
                styles={selectStyles(formErrors.state)}
              />
              {formErrors.state && (
                <div className="text-danger mt-1 text-xs">
                  {formErrors.state}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">
                Zone <span className="text-danger-600">*</span>
              </label>
              <Select
                name="zoneId"
                options={filteredZones.map((z) => ({
                  value: z._id,
                  label: z.name,
                }))}
                value={
                  filteredZones
                    .map((z) => ({ value: z._id, label: z.name }))
                    .find((opt) => opt.value === formData.zoneId) || null
                }
                onChange={(selectedOption) =>
                  handleSelectChange(selectedOption, { name: "zoneId" })
                }
                styles={selectStyles(formErrors.zoneId)}
                placeholder="Select Zone"
                isClearable={true}
                isDisabled={!formData.state}
              />
              {formErrors.zoneId && (
                <div className="text-danger mt-1 text-xs">
                  {formErrors.zoneId}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">
                Region <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                className={`form-control radius-8 ${formErrors.region ? "border-danger" : ""
                  }`}
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="Enter Region Name"
              />
              {formErrors.region && (
                <div className="text-danger mt-1 text-xs">
                  {formErrors.region}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Executive Director (ED){" "}
                <span className="text-danger-600">*</span>
              </label>
              <Select
                name="edId"
                options={edOptions}
                value={getSelectedOption(edOptions, formData.edId)}
                onChange={handleSelectChange}
                styles={selectStyles(formErrors.edId)}
                placeholder="Select ED Name"
                isClearable={true}
              />
              {formErrors.edId && (
                <div className="text-danger mt-1 text-xs">
                  {formErrors.edId}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Regional Director (RD){" "}
                <span className="text-danger-600">*</span>
              </label>
              <Select
                isMulti
                name="rdIds"
                options={rdOptions}
                value={getSelectedOptions(rdOptions, formData.rdIds)}
                onChange={handleMultiSelectChange}
                styles={selectStyles(formErrors.rdIds)}
                placeholder="Select RD Names"
                isClearable={true}
              />
              {formErrors.rdIds && (
                <div className="text-danger mt-1 text-xs">
                  {formErrors.rdIds}
                </div>
              )}
            </div>

            <div className="col-12 mt-7 pt-4">
              <div className="d-flex justify-content-end gap-3">
                <Link
                  to="/region"
                  className="btn btn-outline-secondary radius-8 px-20 py-11 justify-content-center"
                  style={{ width: "120px" }}
                >
                  Cancel
                </Link>
                {hasPermission("Region", id ? "edit" : "add") && (
                  <button
                    type="submit"
                    className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                    style={{ width: "120px" }}
                  >
                    {id ? "Update" : "Save"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegionFormLayer;
