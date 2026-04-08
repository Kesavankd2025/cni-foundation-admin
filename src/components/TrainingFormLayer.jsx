import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import usePermissions from "../hook/usePermissions";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import TrainingApi from "../Api/TrainingApi";
import StandardDatePicker from "./StandardDatePicker";
import ChapterApi from "../Api/ChapterApi";
import RegionApi from "../Api/RegionApi";
import { formatErrorMessage } from "../helper/TextHelper";
import { toISTISOString } from "../helper/DateHelper";
import { Icon } from "@iconify/react/dist/iconify.js";
import { IMAGE_BASE_URL } from "../Config/Index";
import ImageUploadApi from "../Api/ImageUploadApi";
import ZoneApi from "../Api/ZoneApi";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useRef } from "react";

const libraries = ["places"];


const TrainingFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "script-loader",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "[GCP_API_KEY]",
    libraries,
  });

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
            locationOrLink: results[0].formatted_address,
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
          locationOrLink: place.formatted_address || "",
        }));

        if (errors.locationOrLink)
          setErrors((prev) => ({ ...prev, locationOrLink: "" }));

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
      }
    },
    [errors.locationOrLink],
  );

  const onMapClick = useCallback(
    (e) => {
      if (!window.google || !window.google.maps) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      updateLocationFromCoordinates(lat, lng);
      if (errors.locationOrLink)
        setErrors((prev) => ({ ...prev, locationOrLink: "" }));
    },
    [errors.locationOrLink],
  );

  useEffect(() => {
    if (
      isEditingLocation &&
      isLoaded &&
      placeAutocompleteRef.current &&
      window.google
    ) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        placeAutocompleteRef.current,
        {
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "IN" },
        },
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry) {
          handlePlaceSelect(place);
          setIsEditingLocation(false);
        }
      });

      placeAutocompleteRef.current.focus();
    }
  }, [isEditingLocation, isLoaded, handlePlaceSelect]);

  const statusOptions = [
    { value: "upcoming", label: "Upcoming" },
    { value: "live", label: "Live" },
    { value: "completed", label: "Completed" },
  ];

  const [formData, setFormData] = useState({
    zoneIds: [],
    regionIds: [],
    chapterIds: [],
    title: "",
    description: "",
    paymentDetail: {
      accountNumber: "",
      accountName: "",
      branch: "",
      ifsc: "",
    },
    trainerIds: [],
    trainingDateTime: "",
    lastDateForApply: "",
    duration: "",
    mode: null,
    locationOrLink: "",
    latitude: null,
    longitude: null,
    maxAllowed: "",
    trainingFee: "",
    status: statusOptions[0],
  });

  const [zoneOptions, setZoneOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [savedImage, setSavedImage] = useState(null);

  const [trainingImageFile, setTrainingImageFile] = useState(null);
  const [trainingPreviewImage, setTrainingPreviewImage] = useState(null);
  const [trainingExistingImage, setTrainingExistingImage] = useState(null);
  const [trainingSavedImage, setTrainingSavedImage] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const modeOptions = [
    { value: "in-person", label: "In Person" },
    { value: "online", label: "Online" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [
          ZoneApi.getZone(),
          ChapterApi.getChapter({ limit: 500 }),
          RegionApi.getAdminUser(),
        ];

        if (isEditMode) {
          promises.push(TrainingApi.getTraining(id));
        }

        const [zoneRes, chapterRes, trainerRes, trainingRes] = await Promise.all(promises);

        let zones = [];
        let chapters = [];
        let trainers = [];

        if (zoneRes && zoneRes.status && zoneRes.response.data) {
          zones = zoneRes.response.data.map((z) => ({
            value: z._id,
            label: z.name,
          }));
          setZoneOptions([{ value: "all", label: "Select All" }, ...zones]);
        }

        if (chapterRes && chapterRes.status && chapterRes.response.data) {
          chapters = chapterRes.response.data.map((c) => ({
            value: c._id,
            label: c.chapterName,
          }));
          setChapterOptions([{ value: "all", label: "Select All" }, ...chapters]);
        }

        if (trainerRes && trainerRes.status && trainerRes.response.data) {
          trainers = trainerRes.response.data.map((t) => ({
            value: t._id,
            label: t.name,
          }));
          setTrainerOptions([{ value: "all", label: "Select All" }, ...trainers]);
        }

        if (isEditMode && trainingRes && trainingRes.status && trainingRes.response.data) {
          const data = trainingRes.response.data;

          const mappedZoneIds = data.zoneIds
            ? data.zoneIds.map((z) => {
              if (typeof z === "object") {
                return { value: z._id, label: z.name };
              }
              const match = zones.find((opt) => opt.value === z);
              return match || { value: z, label: "Unknown Zone" };
            })
            : [];

          // Cascading initialization for edit mode
          const zoneIdsStr = mappedZoneIds.map(z => z.value).join(",");
          let fetchedRegions = [];
          if (zoneIdsStr) {
            const regRes = await RegionApi.getRegionList(zoneIdsStr);
            if (regRes.status) {
              fetchedRegions = regRes.response.data.map(r => ({ value: r._id, label: r.name || r.region }));
              setRegionOptions([{ value: "all", label: "Select All" }, ...fetchedRegions]);
            }
          }

          const mappedRegionIds = data.regionIds
            ? data.regionIds.map((r) => {
              if (typeof r === "object") {
                return { value: r._id, label: r.name || r.region };
              }
              const match = fetchedRegions.find((opt) => opt.value === r);
              return match || { value: r, label: "Unknown Region" };
            })
            : [];

          const regionIdsStr = mappedRegionIds.map(r => r.value).join(",");
          let fetchedChapters = [];
          if (regionIdsStr) {
            const chapRes = await ChapterApi.getChapter({ regionId: regionIdsStr, limit: 1000 });
            if (chapRes.status) {
              fetchedChapters = chapRes.response.data.map(c => ({ value: c._id, label: c.chapterName }));
              setChapterOptions([{ value: "all", label: "Select All" }, ...fetchedChapters]);
            }
          }

          const mappedChapterIds = data.chapterIds
            ? data.chapterIds.map((c) => {
              if (typeof c === "object") {
                return { value: c._id, label: c.chapterName || c.name };
              }
              const match = fetchedChapters.find((opt) => opt.value === c);
              return match || { value: c, label: "Unknown Chapter" };
            })
            : [];

          const mappedTrainerIds = data.trainerIds
            ? data.trainerIds.map((t) => {
              if (typeof t === "object") {
                return { value: t._id, label: t.name };
              }
              const match = trainers.find((opt) => opt.value === t);
              return match || { value: t, label: "Unknown Trainer" };
            })
            : [];

          const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - offset * 60000);
            return adjustedDate.toISOString().slice(0, 16);
          };

          setFormData({
            zoneIds: mappedZoneIds,
            regionIds: mappedRegionIds,
            chapterIds: mappedChapterIds,
            title: data.title || "",
            description: data.description || "",
            paymentDetail: {
              accountNumber: data.paymentDetail?.accountNumber || "",
              accountName: data.paymentDetail?.accountName || "",
              branch: data.paymentDetail?.branch || "",
              ifsc: data.paymentDetail?.ifsc || "",
            },
            trainerIds: mappedTrainerIds,
            trainingDateTime: formatDateForInput(data.trainingDateTime),
            lastDateForApply: formatDateForInput(data.lastDateForApply),
            duration: data.duration || "",
            mode: data.mode
              ? modeOptions.find(
                (opt) => opt.value === data.mode.toLowerCase(),
              ) || { value: data.mode, label: data.mode }
              : null,
            locationOrLink: data.locationOrLink || data.location?.name || "",
            latitude: data.latitude || data.location?.latitude || null,
            longitude: data.longitude || data.location?.longitude || null,
            maxAllowed: data.maxAllowed || "",
            trainingFee: data.trainingFee || "",
            status: data.status
              ? statusOptions.find(
                (opt) => opt.value === data.status.toLowerCase(),
              ) || { value: data.status, label: data.status }
              : statusOptions[0],
          });

          const lat = data.latitude || data.location?.latitude;
          const lng = data.longitude || data.location?.longitude;
          if (lat && lng) {
            const pos = { lat, lng };
            setMarkerPosition(pos);
            setMapCenter(pos);
          }

          if (data.paymentQrImage) {
            let imageObj;

            if (typeof data.paymentQrImage === "string") {
              const path = data.paymentQrImage;
              const fileName = path.split("/").pop();

              imageObj = {
                fileName: fileName,
                originalName: fileName,
                path: path,
              };
            } else {
              imageObj = data.paymentQrImage;
            }

            setSavedImage(imageObj); // ALWAYS full object

            setExistingImage(imageObj.path);
            setPreviewImage(
              imageObj.path ? `${IMAGE_BASE_URL}/${imageObj.path}` : null
            );
          }

          if (data.trainingImage) {
            let imageObj;
            if (typeof data.trainingImage === "string") {
              const path = data.trainingImage;
              const fileName = path.split("/").pop();
              imageObj = { fileName, originalName: fileName, path };
            } else {
              imageObj = data.trainingImage;
            }
            setTrainingSavedImage(imageObj);
            setTrainingExistingImage(imageObj.path);
            setTrainingPreviewImage(imageObj.path ? `${IMAGE_BASE_URL}/${imageObj.path}` : null);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, id]);

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      paymentDetail: {
        ...prev.paymentDetail,
        [name]: value,
      },
    }));
    if (errors[`paymentDetail.${name}`]) {
      setErrors((prev) => ({ ...prev, [`paymentDetail.${name}`]: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if ((name === "duration" || name === "maxAllowed" || name === "trainingFee") && value < 0) return;
    if ((name === "maxAllowed") && value === "0") return;

    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors.paymentQrImage) {
        setErrors((prev) => ({ ...prev, paymentQrImage: "" }));
      }
    }
  };
  const handleRemoveImage = async () => {
    if (imageFile) {
      setImageFile(null);
      if (existingImage) {
        setPreviewImage(`${IMAGE_BASE_URL}/${existingImage}`);
      } else {
        setPreviewImage(null);
      }
      return;
    }

    if (existingImage) {
      setExistingImage(null);
      setPreviewImage(null);
    }
  };

  const handleTrainingImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTrainingImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrainingPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors.trainingImage) {
        setErrors((prev) => ({ ...prev, trainingImage: "" }));
      }
    }
  };

  const handleRemoveTrainingImage = async () => {
    if (trainingImageFile) {
      setTrainingImageFile(null);
      if (trainingExistingImage) {
        setTrainingPreviewImage(`${IMAGE_BASE_URL}/${trainingExistingImage}`);
      } else {
        setTrainingPreviewImage(null);
      }
      return;
    }

    if (trainingExistingImage) {
      setTrainingExistingImage(null);
      setTrainingPreviewImage(null);
    }
  };

  const handleSelectChange = async (selectedOption, actionMeta) => {
    const { name, action, option } = actionMeta;
    let finalValue = selectedOption || [];

    if (name === "chapterIds" || name === "trainerIds" || name === "zoneIds" || name === "regionIds") {
      if (action === "select-option" && option.value === "all") {
        let currentOptions = [];
        if (name === "chapterIds") currentOptions = chapterOptions;
        else if (name === "trainerIds") currentOptions = trainerOptions;
        else if (name === "zoneIds") currentOptions = zoneOptions;
        else if (name === "regionIds") currentOptions = regionOptions;

        finalValue = currentOptions.filter(
          (opt) => opt.value !== "all"
        );
      } else if (action === "deselect-option" && option.value === "all") {
        finalValue = [];
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Cascading logic
    if (name === "zoneIds") {
      const zoneIds = finalValue.map(z => z.value).filter(v => v !== "all").join(",");
      if (zoneIds) {
        const res = await RegionApi.getRegionList(zoneIds);
        if (res.status) {
          const regions = res.response.data.map(r => ({ value: r._id, label: r.name || r.region }));
          setRegionOptions([{ value: "all", label: "Select All" }, ...regions]);
        }
      } else {
        setRegionOptions([]);
      }
      setFormData(prev => ({ ...prev, regionIds: [], chapterIds: [] }));
      setChapterOptions([]);
    } else if (name === "regionIds") {
      const regionIds = finalValue.map(r => r.value).filter(v => v !== "all").join(",");
      if (regionIds) {
        const res = await ChapterApi.getChapter({ regionId: regionIds, limit: 1000 });
        if (res.status) {
          const chaptersList = res.response.data.map(c => ({ value: c._id, label: c.chapterName }));
          setChapterOptions([{ value: "all", label: "Select All" }, ...chaptersList]);
        }
      } else {
        setChapterOptions([]);
      }
      setFormData(prev => ({ ...prev, chapterIds: [] }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.zoneIds || formData.zoneIds.length === 0) {
      newErrors.zoneIds = formatErrorMessage(
        "please select at least one zone.",
      );
    }
    if (!formData.regionIds || formData.regionIds.length === 0) {
      newErrors.regionIds = formatErrorMessage(
        "please select at least one region.",
      );
    }
    // if (!formData.chapterIds || formData.chapterIds.length === 0) {
    //   newErrors.chapterIds = formatErrorMessage(
    //     "please select at least one chapter.",
    //   );
    // }
    if (!formData.title.trim()) {
      newErrors.title = formatErrorMessage("training title is required.");
    }
    if (!formData.trainerIds || formData.trainerIds.length === 0) {
      newErrors.trainerIds = formatErrorMessage(
        "please select at least one trainer.",
      );
    }
    if (!formData.duration || Number(formData.duration) <= 0) {
      newErrors.duration = formatErrorMessage("duration must be greater than 0.");
    }
    if (!formData.trainingDateTime) {
      newErrors.trainingDateTime = formatErrorMessage(
        "training date & time is required.",
      );
    } else {
      const selected = new Date(formData.trainingDateTime);
      if (selected < new Date()) {
        newErrors.trainingDateTime = formatErrorMessage("training date & time cannot be in the past.");
      }
    }
    if (!formData.lastDateForApply) {
      newErrors.lastDateForApply = formatErrorMessage(
        "last date for apply is required.",
      );
    } else {
      const applyDate = new Date(formData.lastDateForApply);
      const now = new Date();
      // Allow 1 minute buffer for "just now" selections
      if (applyDate < new Date(now.getTime() - 60000)) {
        newErrors.lastDateForApply = formatErrorMessage("last date for apply cannot be in the past.");
      } else if (formData.trainingDateTime) {
        const training = new Date(formData.trainingDateTime);
        if (applyDate > training) {
          newErrors.lastDateForApply = formatErrorMessage("last date for apply must be before training date.");
        }
      }
    }
    if (!formData.mode) {
      newErrors.mode = formatErrorMessage("please select a mode.");
    } else {
      if (!formData.locationOrLink.trim()) {
        newErrors.locationOrLink = formatErrorMessage(
          "location/link is required.",
        );
      }
    }

    if (!formData.maxAllowed || formData.maxAllowed === "0") {
      newErrors.maxAllowed = formatErrorMessage("max allowed must be at least 1.");
    }
    if (formData.trainingFee === "" || formData.trainingFee === null) {
      newErrors.trainingFee = formatErrorMessage("training fee is required.");
    }

    if (Number(formData.trainingFee) > 0) {
      if (!imageFile && !existingImage) {
        newErrors.paymentQrImage = formatErrorMessage("payment QR image is required.");
      }
      if (!trainingImageFile && !trainingExistingImage) {
        newErrors.trainingImage = formatErrorMessage("training image is required.");
      }
      if (!formData.paymentDetail?.accountNumber?.trim()) {
        newErrors["paymentDetail.accountNumber"] = formatErrorMessage("account number is required.");
      }
      if (!formData.paymentDetail?.accountName?.trim()) {
        newErrors["paymentDetail.accountName"] = formatErrorMessage("account name is required.");
      }
      if (!formData.paymentDetail?.branch?.trim()) {
        newErrors["paymentDetail.branch"] = formatErrorMessage("branch is required.");
      }
      if (!formData.paymentDetail?.ifsc?.trim()) {
        newErrors["paymentDetail.ifsc"] = formatErrorMessage("IFSC is required.");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let finalImage = savedImage;

    // If existing image was removed in UI
    if (existingImage === null) {
      finalImage = {
        path: "",
        fileName: "",
        originalName: "",
      };
    }

    // Upload new image
    if (imageFile) {
      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);

      try {
        const uploadRes = await ImageUploadApi.uploadImage({
          formData: uploadFormData,
          path: "training-qr",
        });

        if (uploadRes.status) {
          finalImage = uploadRes.response.data; // full object
        } else {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Image upload failed", error);
        setLoading(false);
        return;
      }
    }

    let finalTrainingImage = trainingSavedImage;
    if (trainingExistingImage === null) {
      finalTrainingImage = {
        path: "",
        fileName: "",
        originalName: "",
      };
    }

    if (trainingImageFile) {
      const uploadFormData = new FormData();
      uploadFormData.append("file", trainingImageFile);
      try {
        const uploadRes = await ImageUploadApi.uploadImage({
          formData: uploadFormData,
          path: "training-images",
        });
        if (uploadRes.status) {
          finalTrainingImage = uploadRes.response.data;
        } else {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Training image upload failed", error);
        setLoading(false);
        return;
      }
    }

    // Check for deletion of old image from server if it was replaced or removed
    if (
      savedImage &&
      savedImage.path &&
      (!finalImage || finalImage.path !== savedImage.path)
    ) {
      await ImageUploadApi.deleteImage({ path: savedImage.path });
    }

    if (
      trainingSavedImage &&
      trainingSavedImage.path &&
      (!finalTrainingImage || finalTrainingImage.path !== trainingSavedImage.path)
    ) {
      await ImageUploadApi.deleteImage({ path: trainingSavedImage.path });
    }

    // Check for deletion of old image
    // const oldPath = typeof savedImage === "string" ? savedImage : savedImage?.path;
    // const newPath = finalImageObject?.path || (typeof finalImageObject === "string" ? finalImageObject : null);

    // if (oldPath && newPath !== oldPath) {
    //   await ImageUploadApi.deleteImage({ path: oldPath });
    // }

    const payload = {
      zoneIds: formData.zoneIds.map((z) => z.value),
      regionIds: formData.regionIds.map((r) => r.value),
      chapterIds: formData.chapterIds.map((c) => c.value),
      title: formData.title,
      description: formData.description,
      trainerIds: formData.trainerIds.map((t) => t.value),
      trainingDateTime: toISTISOString(formData.trainingDateTime),
      lastDateForApply: toISTISOString(formData.lastDateForApply),
      duration: Number(formData.duration),

      mode: formData.mode.value,
      locationOrLink: formData.locationOrLink,
      location: formData.mode.value === "in-person" ? {
        name: formData.locationOrLink,
        latitude: markerPosition?.lat,
        longitude: markerPosition?.lng,
      } : null,
      maxAllowed: Number(formData.maxAllowed) || 0,
      trainingFee: Number(formData.trainingFee) || 0,
      status: formData.status?.value || "upcoming",
      paymentQrImage: finalImage,
      trainingImage: finalTrainingImage,
      paymentDetail: formData.paymentDetail,
    };

    try {
      let response;
      if (isEditMode) {
        response = await TrainingApi.updateTraining({ ...payload, id });
      } else {
        response = await TrainingApi.createTraining(payload);
      }

      if (response && response.status) {
        navigate("/training-list");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Training Session" : "Create Training Session"}
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
                name="zoneIds"
                options={zoneOptions}
                value={formData.zoneIds}
                onChange={handleSelectChange}
                styles={selectStyles(errors.zoneIds)}
                placeholder="Select Zones"
              />
              {errors.zoneIds && (
                <small className="text-danger">{errors.zoneIds}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Region <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                name="regionIds"
                options={regionOptions}
                value={formData.regionIds}
                onChange={handleSelectChange}
                styles={selectStyles(errors.regionIds)}
                placeholder="Select Regions"
              />
              {errors.regionIds && (
                <small className="text-danger">{errors.regionIds}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Chapter
              </label>
              <Select
                isMulti
                name="chapterIds"
                options={chapterOptions}
                value={formData.chapterIds}
                onChange={handleSelectChange}
                styles={selectStyles(errors.chapterIds)}
                placeholder="Select Chapters"
              />
              {errors.chapterIds && (
                <small className="text-danger">{errors.chapterIds}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Training Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Training Title"
              />
              {errors.title && (
                <small className="text-danger">{errors.title}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Trainer Name <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                name="trainerIds"
                options={trainerOptions}
                value={formData.trainerIds}
                onChange={handleSelectChange}
                styles={selectStyles(errors.trainerIds)}
                placeholder="Select Trainers"
              />
              {errors.trainerIds && (
                <small className="text-danger">{errors.trainerIds}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Duration (Hours) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control radius-8"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                step="any"
                placeholder="E.G. 1.5"
              />
              {errors.duration && (
                <small className="text-danger">{errors.duration}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                Training Date & Time <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="trainingDateTime"
                value={formData.trainingDateTime}
                onChange={handleChange}
                enableTime={true}
                minDate="today"
              />
              {errors.trainingDateTime && (
                <small className="text-danger">{errors.trainingDateTime}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                Last Date For Apply <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="lastDateForApply"
                value={formData.lastDateForApply}
                onChange={handleChange}
                enableTime={true}
                minDate="today"
                maxDate={formData.trainingDateTime ? new Date(formData.trainingDateTime) : null}
              />
              {errors.lastDateForApply && (
                <small className="text-danger">{errors.lastDateForApply}</small>
              )}
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">
                Mode <span className="text-danger">*</span>
              </label>
              <Select
                name="mode"
                options={modeOptions}
                value={formData.mode}
                onChange={handleSelectChange}
                styles={selectStyles(errors.mode)}
                placeholder="Select Mode"
              />
              {errors.mode && (
                <small className="text-danger">{errors.mode}</small>
              )}
            </div>

            {formData.mode && (
              <div className="col-12 mt-0">
                <label className="form-label fw-semibold">
                  {formData.mode?.value === "online" ? "Meeting Link" : "Location"} <span className="text-danger">*</span>
                </label>
                {formData.mode?.value === "online" ? (
                  <input
                    type="text"
                    className="form-control radius-8"
                    name="locationOrLink"
                    value={formData.locationOrLink}
                    onChange={handleChange}
                    placeholder="Enter Meeting Link"
                  />
                ) : (
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-4">
                        {isLoaded ? (
                          <div className="position-relative w-100">
                            {!isEditingLocation ? (
                              <div
                                className="form-control radius-8 py-12 d-flex justify-content-between align-items-center cursor-pointer bg-white border shadow-sm transition-all h-56-px"
                                onClick={() => setIsEditingLocation(true)}
                              >
                                <span className={`${formData.locationOrLink ? "text-dark" : "text-secondary-light"} fw-medium`} style={{ fontSize: "14px" }}>
                                  {formData.locationOrLink || "Search or Select Meeting Location"}
                                </span>
                                <div className="ps-12 border-start h-100 d-flex align-items-center" style={{ borderLeft: "1px solid #E2E8F0" }}>
                                  <Icon icon="ion:search-outline" className="text-xl text-secondary-light" />
                                </div>
                              </div>
                            ) : (
                              <div className="input-group border radius-8 bg-white shadow-sm focus-within-border-primary h-56-px">
                                <input
                                  type="text"
                                  className="form-control border-0 px-16 py-12 fw-medium text-dark"
                                  style={{ boxShadow: "none", fontSize: "14px" }}
                                  placeholder="Type address..."
                                  value={formData.locationOrLink}
                                  autoFocus
                                  ref={placeAutocompleteRef}
                                  onChange={(e) => {
                                    setFormData({ ...formData, locationOrLink: e.target.value });
                                  }}
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
                                      if (formData.locationOrLink && isLoaded && window.google) {
                                        const geocoder = new window.google.maps.Geocoder();
                                        geocoder.geocode({ address: formData.locationOrLink }, (results, status) => {
                                          if (status === "OK" && results[0]) {
                                            handlePlaceSelect(results[0]);
                                            setIsEditingLocation(false);
                                          }
                                        });
                                      }
                                    }
                                  }}
                                />
                                <div
                                  className="d-flex align-items-center px-12 border-start bg-neutral-50 cursor-pointer hover-bg-neutral-100 transition-2"
                                  style={{ borderLeft: "1px solid #E2E8F0" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (formData.locationOrLink && isLoaded && window.google) {
                                      const geocoder = new window.google.maps.Geocoder();
                                      geocoder.geocode({ address: formData.locationOrLink }, (results, status) => {
                                        if (status === "OK" && results[0]) {
                                          handlePlaceSelect(results[0]);
                                          setIsEditingLocation(false);
                                        }
                                      });
                                    }
                                  }}
                                >
                                  <Icon icon="ion:search-outline" className="text-xl text-secondary-light" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input type="text" className="form-control radius-8 py-12" placeholder="Loading Location Data..." disabled />
                        )}
                      </div>

                      {isLoaded && typeof google !== "undefined" ? (
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={markerPosition ? 15 : 5}
                          onLoad={onMapLoad}
                          onUnmount={onUnmount}
                          onClick={onMapClick}
                          options={{
                            streetViewControl: true,
                            mapTypeControl: true,
                            fullscreenControl: true,
                            mapTypeId: "hybrid",
                          }}
                        >
                          {markerPosition && (
                            <Marker
                              position={markerPosition}
                              draggable={true}
                              onDragEnd={onMapClick}
                            />
                          )}
                        </GoogleMap>
                      ) : (
                        <div className="d-flex justify-content-center align-items-center bg-light" style={{ ...mapContainerStyle, color: "#999" }}>
                          Loading Map...
                        </div>
                      )}
                      <div className="form-text mt-2 text-sm">
                        Click on the map to automatically fill the location coordinates.
                      </div>
                    </div>
                  </div>
                )}
                {errors.locationOrLink && (
                  <small className="text-danger mt-1 d-block">{errors.locationOrLink}</small>
                )}
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Max Participants Allowed <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control radius-8"
                name="maxAllowed"
                value={formData.maxAllowed}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="1"
                placeholder="Enter Max Participants"
              />
              {errors.maxAllowed && (
                <small className="text-danger">{errors.maxAllowed}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Training Fee <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control radius-8"
                name="trainingFee"
                value={formData.trainingFee}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                placeholder="Enter Training Fee"
              />
              {errors.trainingFee && (
                <small className="text-danger">{errors.trainingFee}</small>
              )}
            </div>

            <div className="col-lg-6">
              <label className="form-label fw-semibold">
                Training Description
              </label>
              <textarea
                className="form-control radius-8"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Enter Training Details..."
              ></textarea>
            </div>

            {Number(formData.trainingFee) > 0 && (
              <div className="col-lg-6">
                <label className="form-label fw-semibold">
                  Payment Details
                </label>
                <div className="row gy-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-sm mb-4">
                      Account Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8 form-control-sm"
                      name="accountNumber"
                      value={formData.paymentDetail?.accountNumber || ""}
                      onChange={handlePaymentDetailChange}
                      placeholder="Account Number"
                    />
                    {errors["paymentDetail.accountNumber"] && (
                      <small className="text-danger">{errors["paymentDetail.accountNumber"]}</small>
                    )}
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-sm mb-4">
                      Account Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8 form-control-sm"
                      name="accountName"
                      value={formData.paymentDetail?.accountName || ""}
                      onChange={handlePaymentDetailChange}
                      placeholder="Account Name"
                    />
                    {errors["paymentDetail.accountName"] && (
                      <small className="text-danger">{errors["paymentDetail.accountName"]}</small>
                    )}
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-sm mb-4">
                      Branch <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8 form-control-sm"
                      name="branch"
                      value={formData.paymentDetail?.branch || ""}
                      onChange={handlePaymentDetailChange}
                      placeholder="Branch Name"
                    />
                    {errors["paymentDetail.branch"] && (
                      <small className="text-danger">{errors["paymentDetail.branch"]}</small>
                    )}
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-sm mb-4">
                      IFSC Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8 form-control-sm"
                      name="ifsc"
                      value={formData.paymentDetail?.ifsc || ""}
                      onChange={handlePaymentDetailChange}
                      placeholder="IFSC Code"
                    />
                    {errors["paymentDetail.ifsc"] && (
                      <small className="text-danger">{errors["paymentDetail.ifsc"]}</small>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={Number(formData.trainingFee) > 0 ? "col-md-6" : "col-lg-6"}>
              <label className="form-label fw-semibold">
                Training Image {Number(formData.trainingFee) > 0 && <span className="text-danger">*</span>}
              </label>

              {!trainingPreviewImage && !trainingImageFile && !loading && (
                <div className="position-relative">
                  <input
                    type="file"
                    className="form-control radius-8"
                    accept="image/*"
                    onChange={handleTrainingImageChange}
                  />
                  {errors.trainingImage && (
                    <small className="text-danger">{errors.trainingImage}</small>
                  )}
                </div>
              )}

              {(trainingPreviewImage || trainingImageFile) && (
                <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light-600">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-100-px h-100-px rounded-8 overflow-hidden border">
                      <img
                        src={trainingPreviewImage}
                        alt="Preview"
                        className="w-100 h-100 object-fit-cover"
                        onError={() => {
                          setTrainingPreviewImage(null);
                          setTrainingExistingImage(null);
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-primary-600 mb-0 fw-medium">
                        {trainingImageFile ? "New Image Selected" : "Current Image"}
                      </p>
                      <p
                        className="text-secondary-400 text-sm mb-0 text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {trainingImageFile
                          ? trainingImageFile.name
                          : (typeof trainingExistingImage === "string" ? trainingExistingImage : trainingExistingImage?.originalName || trainingExistingImage?.path)?.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger-100 text-danger-600 rounded-circle"
                    onClick={handleRemoveTrainingImage}
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

            {Number(formData.trainingFee) > 0 && (
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Payment QR Image <span className="text-danger">*</span>
                </label>

                {!previewImage && !imageFile && !loading && (
                  <div className="position-relative">
                    <input
                      type="file"
                      className="form-control radius-8"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {errors.paymentQrImage && (
                      <small className="text-danger">{errors.paymentQrImage}</small>
                    )}
                  </div>
                )}

                {(previewImage || imageFile) && (
                  <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light-600">
                    <div className="d-flex align-items-center gap-3">
                      <div className="w-100-px h-100-px rounded-8 overflow-hidden border">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-100 h-100 object-fit-cover"
                          onError={() => {
                            setPreviewImage(null);
                            setExistingImage(null);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-primary-600 mb-0 fw-medium">
                          {imageFile ? "New Image Selected" : "Current Image"}
                        </p>
                        <p
                          className="text-secondary-400 text-sm mb-0 text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {imageFile
                            ? imageFile.name
                            : (typeof existingImage === "string" ? existingImage : existingImage?.originalName || existingImage?.path)?.split("/").pop()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-icon btn-danger-100 text-danger-600 rounded-circle"
                      onClick={handleRemoveImage}
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
            )}


          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </button>
            {hasPermission("Training", isEditMode ? "edit" : "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                disabled={loading}
                style={{ width: "120px" }}
              >
                {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
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
    <TrainingFormLayer />
  </>
);
