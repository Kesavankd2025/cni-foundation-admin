import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import usePermissions from "../hook/usePermissions";
import StarUpdateApi from "../Api/StarUpdateApi";
import StandardDatePicker from "./StandardDatePicker";
import ChapterApi from "../Api/ChapterApi";
import BusinessCategoryApi from "../Api/BusinessCategoryApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import ShowNotifications from "../helper/ShowNotifications";
import { formatDate, formatDateTime, getLocalDateForInput } from "../helper/DateHelper";
import { IMAGE_BASE_URL } from "../Config/Index";
import { Icon } from "@iconify/react/dist/iconify.js";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];

const StarUpdateFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { isLoaded } = useJsApiLoader({
    id: "script-loader",
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "[GCP_API_KEY]",
    libraries,
  });

  const [formData, setFormData] = useState({
    zone: [],
    region: [],
    chapter: [],
    category: [],
    title: "",
    details: "",
    lastDate: "",
    location: "",
    contactName: "",
    contactPhoneNumber: "",
    immediateRequirement: false,
  });

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [savedImage, setSavedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const [zoneOptions, setZoneOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
    marginTop: "16px",
  };

  const defaultCenter = {
    lat: 13.0827,
    lng: 80.2707,
  };

  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const mapRef = useRef(null);
  const placeAutocompleteRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const updateLocationFromCoordinates = async (lat, lng) => {
    if (!window.google || !window.google.maps) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setFormData((prev) => ({
            ...prev,
            location: results[0].formatted_address,
          }));
        }
      });
    } catch (error) {
      console.error("Error getting address from coordinates:", error);
    }
  };

  const handlePlaceSelect = useCallback(
    (place) => {
      if (!window.google || !window.google.maps) return;

      if (place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });

        setFormData((prev) => ({
          ...prev,
          location: place.formatted_address || "",
        }));

        if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
      }
    },
    [errors.location],
  );

  useEffect(() => {
    if (isEditingLocation && isLoaded && placeAutocompleteRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        placeAutocompleteRef.current,
        {
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "IN" },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry) {
          handlePlaceSelect(place);
          setIsEditingLocation(false);
        }
      });

      // Maintain focus after initialization if needed
      placeAutocompleteRef.current.focus();
    }
  }, [isEditingLocation, isLoaded, handlePlaceSelect]);

  const onMapClick = useCallback(
    (e) => {
      if (!window.google || !window.google.maps) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      updateLocationFromCoordinates(lat, lng);
      if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
    },
    [errors.location],
  );

  useEffect(() => {
    const initData = async () => {
      try {
        const [zoneRes, chapterRes, categoryRes] = await Promise.all([
          ZoneApi.getZone(),
          ChapterApi.getChapter({ page: 0, limit: 0 }),
          BusinessCategoryApi.getBusinessCategory(null, 0, 0, ""),
        ]);

        let fetchedZoneOptions = [];
        if (zoneRes.status) {
          fetchedZoneOptions = zoneRes.response.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
          if (fetchedZoneOptions.length > 0) {
            fetchedZoneOptions.unshift({ value: "all", label: "Select All" });
          }
          setZoneOptions(fetchedZoneOptions);
        }

        let fetchedChapterOptions = [];
        if (chapterRes.status) {
          fetchedChapterOptions = chapterRes.response.data.map((item) => ({
            value: item._id,
            label: item.chapterName,
          }));
          if (fetchedChapterOptions.length > 0) {
            fetchedChapterOptions.unshift({ value: "all", label: "Select All" });
          }
          setChapterOptions(fetchedChapterOptions);
        }

        let fetchedCategoryOptions = [];
        if (categoryRes.status) {
          fetchedCategoryOptions = categoryRes.response.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
          if (fetchedCategoryOptions.length > 0) {
            fetchedCategoryOptions.unshift({ value: "all", label: "Select All" });
          }
          setCategoryOptions(fetchedCategoryOptions);
        }

        if (isEditMode) {
          const response = await StarUpdateApi.getStarHubUpdateById(id);
          if (response.status) {
            const data = response.response.data;

            // Fetch regions for these zones
            let filteredRegionOptions = [];
            const zoneIds = Array.isArray(data.zoneIds) ? data.zoneIds : (data.zoneId ? [data.zoneId] : []);
            if (zoneIds.length > 0) {
              const regRes = await RegionApi.getRegionList(zoneIds.join(","));
              if (regRes.status) {
                filteredRegionOptions = regRes.response.data.map((item) => ({
                  value: item._id,
                  label: item.name || item.region,
                }));
                if (filteredRegionOptions.length > 0) {
                  filteredRegionOptions.unshift({ value: "all", label: "Select All" });
                }
                setRegionOptions(filteredRegionOptions);
              }
            }

            // Fetch chapters for these regions
            let filteredChapterOptions = [];
            const regionIds = Array.isArray(data.regionIds) ? data.regionIds : (data.regionId ? [data.regionId] : []);
            if (regionIds.length > 0) {
              const chapRes = await ChapterApi.getChapter({ regionId: regionIds.join(","), limit: 1000 });
              if (chapRes.status) {
                filteredChapterOptions = chapRes.response.data.map((item) => ({
                  value: item._id,
                  label: item.chapterName,
                }));
                if (filteredChapterOptions.length > 0) {
                  filteredChapterOptions.unshift({ value: "all", label: "Select All" });
                }
                setChapterOptions(filteredChapterOptions);
              }
            }

            const mapIdsToOptions = (ids, options) => {
              if (!ids) return [];
              const idArray = Array.isArray(ids) ? ids : [ids];
              return idArray.map((id) => {
                const found = options.find((opt) => opt.value === id);
                return found || { value: id, label: "Unknown" };
              });
            };

            const selectedZones = mapIdsToOptions(
              data.zoneIds || data.zoneId,
              fetchedZoneOptions,
            );

            const selectedRegions = mapIdsToOptions(
              data.regionIds || data.regionId,
              filteredRegionOptions,
            );

            const selectedChapters = mapIdsToOptions(
              data.chapterIds || data.chapterId,
              filteredChapterOptions,
            );

            const selectedCategories = mapIdsToOptions(
              data.categoryIds || data.categoryId,
              fetchedCategoryOptions,
            );

            setFormData({
              zone: selectedZones,
              region: selectedRegions,
              chapter: selectedChapters,
              category: selectedCategories,
              title: data.title || "",
              details: data.details || "",
              lastDate: getLocalDateForInput(data.lastDate),
              location: data.location && data.location.name ? data.location.name : (typeof data.location === "string" ? data.location : ""),
              contactName: data.contactName || "",
              contactPhoneNumber: data.contactPhoneNumber || "",
              immediateRequirement: data.immediateRequirement || false,
            });

            if (data.location && data.location.latitude) {
              setMarkerPosition({
                lat: data.location.latitude,
                lng: data.location.longitude,
              });
              setMapCenter({
                lat: data.location.latitude,
                lng: data.location.longitude,
              });
            }

            if (data.image) {
              let imageObj;

              if (typeof data.image === "string") {
                imageObj = { path: data.image };
              } else {
                imageObj = data.image; // full object from backend
              }

              setSavedImage(imageObj);       // ✅ store full object
              setImagePath(imageObj.path);   // for preview
              setPreview(`${IMAGE_BASE_URL}/${imageObj.path}`);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing form data", error);
      }
    };

    initData();
  }, [isEditMode, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "contactPhoneNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      const val = type === "checkbox" ? checked : value;
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleMultiSelectChange = async (selectedOptions, { name }) => {
    let options = [];
    if (name === "zone") options = zoneOptions;
    else if (name === "region") options = regionOptions;
    else if (name === "chapter") options = chapterOptions;
    else options = categoryOptions;

    let newSelectedOptions = selectedOptions || [];

    if (newSelectedOptions.some((opt) => opt.value === "all")) {
      if (formData[name].length === options.length - 1) {
        newSelectedOptions = [];
      } else {
        newSelectedOptions = options.filter((opt) => opt.value !== "all");
      }
    }

    setFormData((prev) => ({ ...prev, [name]: newSelectedOptions }));
    if (errors[name]) setErrors({ ...errors, [name]: "" });

    // Cascading Logic
    if (name === "zone") {
      // Fetch regions based on selected zones
      const zoneIds = newSelectedOptions.map((opt) => opt.value).join(",");
      if (zoneIds) {
        const response = await RegionApi.getRegionList(zoneIds);
        if (response.status) {
          let fetchedOptions = response.response.data.map((item) => ({
            value: item._id,
            label: item.name || item.region,
          }));
          if (fetchedOptions.length > 0) {
            fetchedOptions.unshift({ value: "all", label: "Select All" });
          }
          setRegionOptions(fetchedOptions);
        }
      } else {
        setRegionOptions([]);
      }
      // Reset dependent fields
      setFormData((prev) => ({ ...prev, region: [], chapter: [] }));
      setChapterOptions([]);
    } else if (name === "region") {
      // Fetch chapters based on selected regions
      const regionIds = newSelectedOptions.map((opt) => opt.value).join(",");
      if (regionIds) {
        const response = await ChapterApi.getChapter({ regionIds: regionIds, limit: 0 });
        if (response.status) {
          let fetchedOptions = response.response.data.map((item) => ({
            value: item._id,
            label: item.chapterName,
          }));
          if (fetchedOptions.length > 0) {
            fetchedOptions.unshift({ value: "all", label: "Select All" });
          }
          setChapterOptions(fetchedOptions);
        }
      } else {
        setChapterOptions([]);
      }
      // Reset dependent fields
      setFormData((prev) => ({ ...prev, chapter: [] }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileObj = e.target.files[0];
      setSelectedFile(fileObj);
      setPreview(URL.createObjectURL(fileObj));
      if (errors.image) setErrors({ ...errors, image: "" });
    }
  };

  const handleDeleteImage = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (imagePath) {
        setPreview(`${IMAGE_BASE_URL}/${imagePath}`);
      } else {
        setPreview(null);
      }
      return;
    }

    // If no selectedFile, and we are deleting the existing imagePath
    if (imagePath) {
      setImagePath("");
      setPreview(null);
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (formData.zone.length === 0)
      tempErrors.zone = "Zone is Required";
    if (formData.region.length === 0)
      tempErrors.region = "Region is Required";
    if (formData.chapter.length === 0)
      tempErrors.chapter = "Chapter is Required";
    if (formData.category.length === 0)
      tempErrors.category = "Category is Required";
    if (!formData.title.trim()) tempErrors.title = "Title is Required";
    if (!formData.lastDate) tempErrors.lastDate = "Last Date is Required";
    if (!formData.details.trim()) tempErrors.details = "Details are Required";
    if (!formData.location.trim()) tempErrors.location = "Location is Required";
    if (!formData.contactName.trim()) tempErrors.contactName = "Contact Name is Required";
    if (!formData.contactPhoneNumber.trim()) {
      tempErrors.contactPhoneNumber = "Contact Phone Number is Required";
    } else if (formData.contactPhoneNumber.length !== 10) {
      tempErrors.contactPhoneNumber = "Phone Number must be 10 digits";
    }
    if (!imagePath && !selectedFile) tempErrors.image = "Image is Required";


    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsUploading(true);

    let finalImageData = savedImage;

    // If existing image was removed in UI
    if (imagePath === "") {
      finalImageData = {
        path: "",
        fileName: "",
        originalName: "",
      };
    }

    if (selectedFile) {
      const formDataImage = new FormData();
      formDataImage.append("file", selectedFile);

      try {
        const uploadResponse = await ImageUploadApi.uploadImage({
          formData: formDataImage,
          path: "star-update",
        });

        if (uploadResponse.status) {
          finalImageData = uploadResponse.response.data;
        } else {
          setIsUploading(false);
          return;
        }
      } catch (error) {
        setIsUploading(false);
        return;
      }
    }

    // Check for deletion of old image
    if (
      savedImage &&
      savedImage.path &&
      (!finalImageData || finalImageData.path !== savedImage.path)
    ) {
      await ImageUploadApi.deleteImage({ path: savedImage.path });
    }

    const payload = {
      zoneIds: formData.zone.map((z) => z.value),
      regionIds: formData.region.map((r) => r.value),
      chapterIds: formData.chapter.map((c) => c.value),
      categoryIds: formData.category.map((c) => c.value),
      title: formData.title,
      details: formData.details,
      lastDate: formData.lastDate,
      location: {
        name: formData.location,
        latitude: markerPosition?.lat,
        longitude: markerPosition?.lng,
      },
      contactName: formData.contactName,
      contactPhoneNumber: formData.contactPhoneNumber,
      immediateRequirement: Boolean(formData.immediateRequirement),
      image: finalImageData,
    };

    let response;
    if (isEditMode) {
      response = await StarUpdateApi.updateStarHubUpdate({ ...payload, id });
    } else {
      response = await StarUpdateApi.createStarHubUpdate(payload);
    }

    setIsUploading(false);

    if (response.status) {
      navigate("/star-update");
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Project" : "Create New Project"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Zone <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                name="zone"
                options={zoneOptions}
                value={formData.zone}
                onChange={handleMultiSelectChange}
                placeholder="Select Zones"
                styles={selectStyles(errors.zone)}
              />
              {errors.zone && (
                <p className="text-danger text-xs mt-1">{errors.zone}</p>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Region <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                name="region"
                options={regionOptions}
                value={formData.region}
                onChange={handleMultiSelectChange}
                placeholder="Select Regions"
                styles={selectStyles(errors.region)}
              />
              {errors.region && (
                <p className="text-danger text-xs mt-1">{errors.region}</p>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Chapter <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                name="chapter"
                options={chapterOptions}
                value={formData.chapter}
                onChange={handleMultiSelectChange}
                placeholder="Select Chapters"
                styles={selectStyles(errors.chapter)}
              />
              {errors.chapter && (
                <p className="text-danger text-xs mt-1">{errors.chapter}</p>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Category <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                name="category"
                options={categoryOptions}
                value={formData.category}
                onChange={handleMultiSelectChange}
                placeholder="Select Categories"
                styles={selectStyles(errors.category)}
              />
              {errors.category && (
                <p className="text-danger text-xs mt-1">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Title"
              />
              {errors.title && (
                <p className="text-danger text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Last Date */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Last Date <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="lastDate"
                value={formData.lastDate}
                onChange={handleChange}
              />
              {errors.lastDate && (
                <p className="text-danger text-xs mt-1">
                  {errors.lastDate}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Image <span className="text-danger">*</span>
              </label>
              {!imagePath && !selectedFile && !isUploading && (
                <div className="position-relative">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {errors.image && (
                    <p className="text-danger text-xs mt-1">
                      {errors.image}
                    </p>
                  )}
                </div>
              )}

              {isUploading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Uploading...</span>
                  </div>
                  <p className="mt-2">Uploading...</p>
                </div>
              )}

              {(imagePath || selectedFile) && !isUploading && (
                <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light-600">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-100-px h-100-px rounded-8 overflow-hidden border">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-100 h-100 object-fit-cover"
                        onError={() => {
                          setPreview(null);
                          setImagePath("");
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-primary-600 mb-0 fw-medium">
                        {selectedFile ? "New Image Selected" : "Uploaded Image"}
                      </p>
                      <p
                        className="text-secondary-400 text-sm mb-0 text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {selectedFile
                          ? selectedFile.name
                          : imagePath.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger-100 text-danger-600 rounded-circle"
                    onClick={handleDeleteImage}
                    title="Delete Image"
                  >
                    <Icon
                      icon="mingcute:delete-2-line"
                      width="24"
                      height="24"
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Contact Name */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Contact Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Enter Contact Name"
              />
              {errors.contactName && (
                <p className="text-danger text-xs mt-1">{errors.contactName}</p>
              )}
            </div>

            {/* Contact Phone Number */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Contact Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="contactPhoneNumber"
                value={formData.contactPhoneNumber}
                onChange={handleChange}
                placeholder="Enter Contact Phone Number"
                maxLength={10}
              />
              {errors.contactPhoneNumber && (
                <p className="text-danger text-xs mt-1">{errors.contactPhoneNumber}</p>
              )}
            </div>


            <div className="col-12 mt-0">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Location <span className="text-danger-600">*</span>
                </label>
                {isLoaded ? (
                  <div className="position-relative w-100">
                    {!isEditingLocation ? (
                      <div
                        className="form-control radius-8 py-12 d-flex justify-content-between align-items-center cursor-pointer bg-white border shadow-sm transition-all h-56-px"
                        onClick={() => setIsEditingLocation(true)}
                      >
                        <span className={`${formData.location ? "text-dark" : "text-secondary-light"} fw-medium`} style={{ fontSize: "14px" }}>
                          {formData.location || "Search or Select Meeting Location"}
                        </span>
                        <div className="ps-12 border-start h-100 d-flex align-items-center" style={{ borderLeft: "1px solid #E2E8F0" }}>
                          <Icon icon="ion:search-outline" className="text-xl text-secondary-light" />
                        </div>
                      </div>
                    ) : (
                      <div className="input-group border radius-8 bg-white shadow-sm focus-within-border-primary h-56-px">
                        <input
                          type="text"
                          name="location"
                          className="form-control border-0 px-16 py-12 fw-medium text-dark"
                          style={{ boxShadow: "none", fontSize: "14px" }}
                          placeholder="Type address..."
                          value={formData.location}
                          autoFocus
                          onChange={handleChange}
                          ref={placeAutocompleteRef}
                          onBlur={() => {
                            setTimeout(() => {
                              if (!placeAutocompleteRef.current?.matches(':focus')) {
                                setIsEditingLocation(false);
                              }
                            }, 200);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                formData.location &&
                                isLoaded &&
                                window.google &&
                                window.google.maps &&
                                window.google.maps.places
                              ) {
                                const geocoder =
                                  new window.google.maps.Geocoder();
                                geocoder.geocode(
                                  { address: formData.location },
                                  (results, status) => {
                                    if (status === "OK" && results[0]) {
                                      const place = results[0];
                                      handlePlaceSelect(place);
                                      setIsEditingLocation(false);
                                    }
                                  },
                                );
                              }
                            }
                          }}
                        />
                        <div
                          className="d-flex align-items-center px-12 border-start bg-neutral-50 cursor-pointer hover-bg-neutral-100 transition-2"
                          style={{ borderLeft: "1px solid #E2E8F0" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              formData.location &&
                              isLoaded &&
                              window.google &&
                              window.google.maps &&
                              window.google.maps.places
                            ) {
                              const geocoder = new window.google.maps.Geocoder();
                              geocoder.geocode(
                                { address: formData.location },
                                (results, status) => {
                                  if (status === "OK" && results[0]) {
                                    const place = results[0];
                                    handlePlaceSelect(place);
                                    setIsEditingLocation(false);
                                  } else {
                                    console.error("Geocode failed: " + status);
                                  }
                                },
                              );
                            }
                          }}
                        >
                          <Icon icon="ion:search-outline" className="text-xl text-secondary-light" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="location"
                    className="form-control radius-8 py-12"
                    placeholder="Loading Location Data..."
                    disabled
                  />
                )}
                {errors.location && (
                  <p className="text-danger text-xs mt-1">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="col-12 mt-0">
              {isLoaded && typeof google !== "undefined" ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={markerPosition ? 15 : 5}
                  onLoad={onMapLoad}
                  onUnmount={onUnmount}
                  onClick={isLoaded ? onMapClick : undefined}
                  options={{
                    streetViewControl: isLoaded,
                    mapTypeControl: isLoaded,
                    fullscreenControl: isLoaded,
                    mapTypeId: "hybrid",
                    mapTypeControlOptions: {
                      mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"],
                      style:
                        (isLoaded &&
                          window.google?.maps?.MapTypeControlStyle
                            ?.HORIZONTAL_BAR) ||
                        "HORIZONTAL_BAR",
                      position:
                        (isLoaded &&
                          window.google?.maps?.ControlPosition?.TOP_RIGHT) ||
                        "TOP_RIGHT",
                    },
                  }}
                >
                  {markerPosition && (
                    <Marker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={(e) => {
                        onMapClick(e);
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center bg-light"
                  style={{ ...mapContainerStyle, color: "#999" }}
                >
                  Loading Map...
                </div>
              )}
              <div className="form-text mt-2">
                Click on the map to automatically fill the location coordinates.
              </div>
            </div>
            {/* Details */}
            <div className="col-lg-8 col-md-6">
              <label className="form-label fw-semibold">
                Details <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control radius-8"
                rows="4"
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Enter Details"
              />
              {errors.details && (
                <p className="text-danger text-xs mt-1">{errors.details}</p>
              )}
            </div>

            {/* Immediate Requirement */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold" style={{ visibility: "hidden" }}>
                Spacer
              </label>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="immediateRequirement"
                  id="immediateRequirement"
                  checked={formData.immediateRequirement}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="immediateRequirement">
                  Immediate Requirement
                </label>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/star-update"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            {hasPermission("CNI Projects", isEditMode ? "edit" : "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                style={{ width: "120px" }}
                disabled={isUploading}
              >

                {isEditMode ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div >
    </div >
  );
};

// Add global styles for Google Places Autocomplete dropdown
const globalStyles = `
  .pac-container {
    z-index: 9999 !important;
    border-radius: 8px;
    border-top: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-family: inherit;
  }
  .pac-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .pac-item:hover {
    background-color: #f8f9fa;
  }
  .pac-icon {
    margin-right: 10px;
  }
  .pac-item-query {
    font-size: 14px;
    color: #333;
  }
`;

const StyleLoader = () => (
  <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
);

export default () => (
  <>
    <StyleLoader />
    <StarUpdateFormLayer />
  </>
);
