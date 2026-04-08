import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import usePermissions from "../hook/usePermissions";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Country, State } from "country-state-city";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import ChapterApi from "../Api/ChapterApi";
import StandardDatePicker from "./StandardDatePicker";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import { formatErrorMessage } from "../helper/TextHelper";
import { getLocalDateForInput } from "../helper/DateHelper";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const ChapterFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    chapterName: "",
    country: "",
    state: "",
    zoneId: "",
    regionId: "",
    edId: "",
    rdId: "",
    createdDate: getLocalDateForInput(new Date()),
    location: "",
    weekday: "",
    meetingType: "",
    isActive: 1,
    absentLimit: "",
    proxyLimit: "",
    chapterImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const [zoneOptions, setZoneOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [allRegions, setAllRegions] = useState([]);
  const [edOptions, setEdOptions] = useState([]);
  const [rdOptions, setRdOptions] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      getChapterById(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.state) {
      fetchZones(formData.state);
    } else {
      setZoneOptions([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.zoneId) {
      fetchRegions(formData.zoneId);
    } else {
      setRegionOptions([]);
      setAllRegions([]);
      setEdOptions([]);
      setRdOptions([]);
    }
  }, [formData.zoneId]);

  const fetchZones = async (stateName) => {
    if (!stateName) return;
    const response = await ZoneApi.getZoneByState(stateName);
    if (response && response.status && response.response.data) {
      const zones = response.response.data;
      setZoneOptions(zones.map((z) => ({ value: z._id, label: z.name })));
    } else {
      setZoneOptions([]);
    }
  };

  const fetchRegions = async (zoneId) => {
    if (!zoneId) {
      setRegionOptions([]);
      setEdOptions([]);
      setRdOptions([]);
      return;
    }
    const response = await RegionApi.getRegionList(zoneId);
    if (response && response.status && response.response.data) {
      const regions = response.response.data;
      setAllRegions(regions);

      // Set Region Options
      setRegionOptions(
        regions.map((r) => ({ value: r._id, label: r.region || r.name })),
      );

      // Extract Unique ED Options from Regions
      const edMap = new Map();
      regions.forEach((r) => {
        const edId = r.edId?._id || r.edId;
        if (edId && r.edName) {
          edMap.set(edId, { value: edId, label: r.edName });
        }
      });
      setEdOptions(Array.from(edMap.values()));

      // Extract Unique RD Options from Regions
      const rdMap = new Map();
      regions.forEach((r) => {
        if (r.rdIds && Array.isArray(r.rdIds)) {
          r.rdIds.forEach((id, idx) => {
            const rdId = id?._id || id;
            const rdName = r.rdNames && r.rdNames[idx];
            if (rdId && rdName) {
              rdMap.set(rdId, { value: rdId, label: rdName });
            }
          });
        }
      });
      setRdOptions(Array.from(rdMap.values()));
    }
  };

  const getChapterById = async (id) => {
    const response = await ChapterApi.getChapter(id);
    if (response && response.status && response.response.data) {
      const data = response.response.data;
      setFormData({
        ...data,
        zoneId: data.zoneId?._id || data.zoneId,
        regionId: data.regionId?._id || data.regionId,
        edId: data.edId?._id || data.edId,
        rdId: data.rdId?._id || data.rdId,
        createdDate: getLocalDateForInput(data.createdDate),
        absentLimit: data.absentLimit || "",
        proxyLimit: data.proxyLimit || "",
        chapterImage: data.chapterImage || null,
      });

      if (data.chapterImage) {
        setImagePreview(`${IMAGE_BASE_URL}/${data.chapterImage.path || data.chapterImage}`);
      }
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === data.country || c.isoCode === data.country,
      );
      if (countryObj) {
        setSelectedCountry({
          value: countryObj.isoCode,
          label: countryObj.name,
        });
        setFormData((prev) => ({ ...prev, country: countryObj.isoCode }));
        const stateObj = State.getStatesOfCountry(countryObj.isoCode).find(
          (s) => s.name === data.state || s.isoCode === data.state,
        );
        if (stateObj) {
          setSelectedState({ value: stateObj.isoCode, label: stateObj.name });
          setFormData((prev) => ({ ...prev, state: stateObj.name }));
        }
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.chapterName)
      newErrors.chapterName = formatErrorMessage("chapter name is required");
    if (!formData.country)
      newErrors.country = formatErrorMessage("country is required");
    if (!formData.state)
      newErrors.state = formatErrorMessage("state is required");
    if (!formData.zoneId)
      newErrors.zoneId = formatErrorMessage("zone is required");
    if (!formData.regionId)
      newErrors.regionId = formatErrorMessage("region is required");
    if (!formData.edId)
      newErrors.edId = formatErrorMessage("executive director is required");
    if (!formData.rdId)
      newErrors.rdId = formatErrorMessage("regional director is required");
    if (!formData.createdDate)
      newErrors.createdDate = formatErrorMessage("created date is required");
    if (!formData.location)
      newErrors.location = formatErrorMessage("location is required");
    if (!formData.weekday)
      newErrors.weekday = formatErrorMessage("weekday is required");
    if (!formData.meetingType)
      newErrors.meetingType = formatErrorMessage("meeting type is required");
    if (!formData.absentLimit) {
      newErrors.absentLimit = formatErrorMessage("absent limit is required");
    } else if (Number(formData.absentLimit) < 1 || Number(formData.absentLimit) > 10) {
      newErrors.absentLimit = formatErrorMessage("absent limit must be between 1 and 10");
    }

    if (!formData.proxyLimit) {
      newErrors.proxyLimit = formatErrorMessage("proxy limit is required");
    } else if (Number(formData.proxyLimit) < 1 || Number(formData.proxyLimit) > 10) {
      newErrors.proxyLimit = formatErrorMessage("proxy limit must be between 1 and 10");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fieldOptions = {
    weekday: [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ],
    meetingType: [
      { value: "in-person", label: "In Person" },
      { value: "online", label: "Online" },
      { value: "hybrid", label: "Hybrid" },
    ],
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, chapterImage: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.chapterImage) {
        setErrors((prev) => ({ ...prev, chapterImage: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      let imageToSave = formData.chapterImage;

      // If image is a File object, upload it
      if (formData.chapterImage instanceof File) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.chapterImage);

        const imageRes = await ImageUploadApi.uploadImage({
          formData: formDataUpload,
          path: "chapters"
        });

        if (imageRes.status) {
          imageToSave = {
            originalName: imageRes.response.data.originalName,
            fileName: imageRes.response.data.fileName,
            path: imageRes.response.data.path
          };
        } else {
          return; // Error handled in Api
        }
      }

      const payload = {
        ...formData,
        chapterImage: imageToSave,
        country: selectedCountry?.name || formData.country,
        state: selectedState?.name || formData.state,
        absentLimit: parseInt(formData.absentLimit) || 0,
        proxyLimit: parseInt(formData.proxyLimit) || 0,
        isActive: 1,
      };
      let response;
      if (isEditMode) {
        response = await ChapterApi.updateChapter({ ...payload, id });
      } else {
        response = await ChapterApi.createChapter(payload);
      }

      if (response && response.status) {
        navigate("/chapter-creation");
      }
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Chapter" : "Create Chapter"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Chapter Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="chapterName"
                value={formData.chapterName}
                onChange={handleChange}
                placeholder="Enter Chapter Name"
              />
              {errors.chapterName && (
                <small className="text-danger">{errors.chapterName}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Country <span className="text-danger">*</span>
              </label>
              <Select
                options={Country.getAllCountries().map((country) => ({
                  value: country.isoCode,
                  label: country.name,
                }))}
                value={selectedCountry}
                onChange={(option) => {
                  setSelectedCountry(option);
                  setSelectedState(null);
                  setFormData((prev) => ({
                    ...prev,
                    country: option ? option.value : "",
                    state: "",
                    zoneId: "",
                    edId: "",
                    rdId: "",
                  }));
                  if (errors.country)
                    setErrors((prev) => ({ ...prev, country: "" }));
                }}
                placeholder="Select Country"
                styles={selectStyles(errors.country)}
                error={errors.country}
              />
              {errors.country && (
                <small className="text-danger">{errors.country}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                State <span className="text-danger">*</span>
              </label>
              <Select
                options={
                  formData.country
                    ? State.getStatesOfCountry(formData.country).map(
                      (state) => ({
                        value: state.isoCode,
                        label: state.name,
                      }),
                    )
                    : []
                }
                value={selectedState}
                onChange={(option) => {
                  setSelectedState(option);
                  setFormData((prev) => ({
                    ...prev,
                    state: option ? option.label : "",
                    zoneId: "",
                    edId: "",
                    rdId: "",
                  }));
                  if (errors.state)
                    setErrors((prev) => ({ ...prev, state: "" }));
                }}
                placeholder="Select State"
                styles={selectStyles(errors.state)}
                isDisabled={!formData.country}
                error={errors.state}
              />
              {errors.state && (
                <small className="text-danger">{errors.state}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Zone <span className="text-danger">*</span>
              </label>
              <Select
                options={zoneOptions}
                value={zoneOptions.find((opt) => opt.value === formData.zoneId)}
                onChange={(option) => {
                  handleSelectChange(option, { name: "zoneId" });
                  if (!option) {
                    setRegionOptions([]);
                    setFormData((prev) => ({
                      ...prev,
                      regionId: "",
                      edId: "",
                      rdId: "",
                    }));
                  }
                }}
                placeholder="Select Zone"
                styles={selectStyles(errors.zoneId)}
                isDisabled={!formData.state}
                error={errors.zoneId}
              />
              {errors.zoneId && (
                <small className="text-danger">{errors.zoneId}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Region <span className="text-danger">*</span>
              </label>
              <Select
                name="regionId"
                options={regionOptions}
                value={regionOptions.find(
                  (opt) => opt.value === formData.regionId,
                )}
                onChange={(option) => {
                  handleSelectChange(option, { name: "regionId" });
                  if (option) {
                    const selectedReg = allRegions.find(
                      (r) => r._id === option.value,
                    );
                    if (selectedReg) {
                      const regionEdId =
                        selectedReg.edId?._id || selectedReg.edId || "";

                      // Extract RDs for this region only
                      const regionRds = [];
                      if (
                        selectedReg.rdIds &&
                        Array.isArray(selectedReg.rdIds)
                      ) {
                        selectedReg.rdIds.forEach((id, idx) => {
                          const rdId = id?._id || id;
                          const rdName =
                            selectedReg.rdNames && selectedReg.rdNames[idx];
                          if (rdId && rdName) {
                            regionRds.push({ value: rdId, label: rdName });
                          }
                        });
                      }

                      setFormData((prev) => ({
                        ...prev,
                        edId: regionEdId,
                        rdId:
                          regionRds.length === 1
                            ? regionRds[0].value
                            : prev.rdId,
                      }));
                    }
                  } else {
                    setFormData((prev) => ({ ...prev, edId: "", rdId: "" }));
                  }
                }}
                placeholder="Select Region"
                styles={selectStyles(errors.regionId)}
                error={errors.regionId}
              />
              {errors.regionId && (
                <small className="text-danger">{errors.regionId}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Executive Director <span className="text-danger">*</span>
              </label>
              <Select
                name="edId"
                options={edOptions}
                value={edOptions.find((opt) => opt.value === formData.edId)}
                onChange={handleSelectChange}
                placeholder="Select Executive Director"
                styles={selectStyles(errors.edId)}
                error={errors.edId}
                isDisabled={true}
              />
              {errors.edId && (
                <small className="text-danger">{errors.edId}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Regional Director <span className="text-danger">*</span>
              </label>
              <Select
                name="rdId"
                options={
                  formData.regionId
                    ? (
                      allRegions.find((r) => r._id === formData.regionId)
                        ?.rdIds || []
                    )
                      .map((id, idx) => {
                        const r = allRegions.find(
                          (r) => r._id === formData.regionId,
                        );
                        const rdId = id?._id || id;
                        const rdName = r.rdNames && r.rdNames[idx];
                        return { value: rdId, label: rdName };
                      })
                      .filter((opt) => opt.value && opt.label)
                    : rdOptions
                }
                value={rdOptions.find((opt) => opt.value === formData.rdId)}
                onChange={handleSelectChange}
                placeholder="Select Regional Director"
                styles={selectStyles(errors.rdId)}
                error={errors.rdId}
              />
              {errors.rdId && (
                <small className="text-danger">{errors.rdId}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Chapter Created Date <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="createdDate"
                value={formData.createdDate}
                onChange={handleChange}
              />
              {errors.createdDate && (
                <small className="text-danger">{errors.createdDate}</small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter Location"
              />
              {errors.location && (
                <small className="text-danger">{errors.location}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Weekday <span className="text-danger">*</span>
              </label>
              <Select
                name="weekday"
                options={fieldOptions.weekday}
                value={fieldOptions.weekday.find(
                  (opt) => opt.value === formData.weekday,
                )}
                onChange={handleSelectChange}
                placeholder="Select Weekday"
                styles={selectStyles(errors.weekday)}
                error={errors.weekday}
              />
              {errors.weekday && (
                <small className="text-danger">{errors.weekday}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Meeting Type <span className="text-danger">*</span>
              </label>
              <Select
                name="meetingType"
                options={fieldOptions.meetingType}
                value={fieldOptions.meetingType.find(
                  (opt) => opt.value === formData.meetingType,
                )}
                onChange={handleSelectChange}
                placeholder="Select Meeting Type"
                styles={selectStyles(errors.meetingType)}
                error={errors.meetingType}
              />
              {errors.meetingType && (
                <small className="text-danger">{errors.meetingType}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Absent Limit <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control radius-8"
                name="absentLimit"
                value={formData.absentLimit}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && (Number(val) < 0 || Number(val) > 10)) return;
                  handleChange(e);
                }}
                placeholder="Enter Absent Limit"
              />
              {errors.absentLimit && (
                <small className="text-danger">{errors.absentLimit}</small>
              )}
            </div>

            {/* Chapter Image */}
            <div className="col-md-6 mt-4">
              <label className="form-label fw-semibold">Chapter Image</label>
              <div className="upload-image-wrapper d-flex align-items-center gap-3">
                {imagePreview ? (
                  <div className="uploaded-img position-relative h-120-px w-120-px border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, chapterImage: null }));
                      }}
                      className="uploaded-img__remove position-absolute top-0 end-0 z-1 text-2xxl line-height-1 me-8 mt-8 d-flex"
                    >
                      <Icon
                        icon="radix-icons:cross-2"
                        className="text-xl text-danger-600"
                      ></Icon>
                    </button>
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={imagePreview}
                      alt="Preview"
                    />
                  </div>
                ) : (
                  <label
                    className="upload-file h-120-px w-120-px border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 bg-hover-neutral-200 d-flex align-items-center flex-column justify-content-center gap-1 cursor-pointer"
                    htmlFor="chapter-image-upload"
                  >
                    <Icon
                      icon="solar:camera-outline"
                      className="text-xl text-secondary-light"
                    ></Icon>
                    <span className="fw-semibold text-secondary-light">Upload</span>
                  </label>
                )}
                <input
                  id="chapter-image-upload"
                  type="file"
                  onChange={onImageChange}
                  hidden
                  accept="image/*"
                />
              </div>
            </div>

            <div className="col-md-6 mt-4">
              <label className="form-label fw-semibold">
                Proxy Limit <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control radius-8"
                name="proxyLimit"
                value={formData.proxyLimit}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && (Number(val) < 0 || Number(val) > 10)) return;
                  handleChange(e);
                }}
                placeholder="Enter Proxy Limit"
              />
              {errors.proxyLimit && (
                <small className="text-danger">{errors.proxyLimit}</small>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/chapter-creation"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            {hasPermission("Chapter Creation", isEditMode ? "edit" : "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                style={{ width: "120px" }}
              >
                {isEditMode ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterFormLayer;
