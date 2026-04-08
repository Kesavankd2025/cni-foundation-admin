import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import usePermissions from "../hook/usePermissions";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader, // Replaced LoadScript with useJsApiLoader
} from "@react-google-maps/api";
import MeetingApi from "../Api/MeetingApi";
import ChapterApi from "../Api/ChapterApi";
import { formatErrorMessage } from "../helper/TextHelper";
import StandardDatePicker from "./StandardDatePicker";
import { toISTISOString } from "../helper/DateHelper";


const libraries = ["places"];

const MeetingFormLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const { id } = useParams();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "[GCP_API_KEY]",
    libraries,
  });

  const [formData, setFormData] = useState({
    topic: "",
    meetingFee: "",
    visitorFee: "",
    chapters: [],
    hotelName: "",
    startDate: "",
    endDate: "",
    latePunchTime: "",
    location: "",
  });

  const [chapterOptions, setChapterOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.topic)
      newErrors.topic = formatErrorMessage("meeting topic is required");
    if (!formData.meetingFee)
      newErrors.meetingFee = formatErrorMessage("meeting fee is required");
    if (!formData.visitorFee)
      newErrors.visitorFee = formatErrorMessage("visitor fee is required");
    if (!formData.chapters || formData.chapters.length === 0)
      newErrors.chapters = formatErrorMessage(
        "at least one chapter is required",
      );
    if (!formData.hotelName)
      newErrors.hotelName = formatErrorMessage("hotel name is required");
    if (!formData.startDate)
      newErrors.startDate = formatErrorMessage("start date & time is required");
    if (!formData.endDate)
      newErrors.endDate = formatErrorMessage("end date & time is required");
    if (!formData.latePunchTime)
      newErrors.latePunchTime = formatErrorMessage(
        "late punch time is required",
      );
    if (!formData.location)
      newErrors.location = formatErrorMessage("location is required");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    const init = async () => {
      const promises = [fetchChapters()];
      if (id) {
        promises.push(fetchMeeting(id));
      }
      await Promise.all(promises);
    };
    init();
  }, [id]);

  const fetchChapters = async () => {
    try {
      const response = await ChapterApi.getChapter();
      if (response.status && response.response.data) {
        const options = response.response.data.map((chapter) => ({
          value: chapter._id,
          label: chapter.chapterName,
        }));
        setChapterOptions(options);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const fetchMeeting = async (id) => {
    try {
      const response = await MeetingApi.getMeeting(id);
      if (response.status && response.response.data) {
        const meeting = response.response.data;

        // Extract IDs if chapters are objects
        const chapterIds =
          meeting.chapters && Array.isArray(meeting.chapters)
            ? meeting.chapters.map((ch) =>
              typeof ch === "object" && ch._id ? ch._id : ch,
            )
            : [];

        setFormData({
          topic: meeting.meetingTopic,
          meetingFee: meeting.meetingFee,
          visitorFee: meeting.visitorFee,
          chapters: chapterIds,
          hotelName: meeting.hotelName,
          startDate: formatDateForInput(meeting.startDateTime),
          endDate: formatDateForInput(meeting.endDateTime),
          latePunchTime: formatDateForInput(meeting.latePunchTime),
          location:
            meeting.location && meeting.location.name
              ? meeting.location.name
              : "",
        });

        if (meeting.location && meeting.location.latitude) {
          setMarkerPosition({
            lat: meeting.location.latitude,
            lng: meeting.location.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
    }
  };

  const formatDateForInput = (dateString) => {
    return dateString || "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent negative fees
    if ((name === "meetingFee" || name === "visitorFee") && value < 0) return;

    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (selectedOptions, { name }) => {
    if (name === "chapters") {
      const values = selectedOptions ? [selectedOptions.value] : [];
      setFormData({ ...formData, [name]: values });
    } else {
      setFormData({
        ...formData,
        [name]: selectedOptions ? selectedOptions.value : "",
      });
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const payload = {
        meetingTopic: formData.topic,
        meetingFee: parseFloat(formData.meetingFee),
        visitorFee: parseFloat(formData.visitorFee),
        hotelName: formData.hotelName,
        chapters: formData.chapters,
        startDateTime: toISTISOString(formData.startDate),
        endDateTime: toISTISOString(formData.endDate),
        latePunchTime: toISTISOString(formData.latePunchTime),
        location: {

          name: formData.location,
          latitude: markerPosition?.lat,
          longitude: markerPosition?.lng,
        },
      };

      let response;
      if (id) {
        response = await MeetingApi.updateMeeting(id, payload);
      } else {
        response = await MeetingApi.createMeeting(payload);
      }

      if (response.status) {
        navigate("/meeting-creation");
      }
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">
          {id ? "Edit Meeting" : "Create Meeting"}
        </h6>
        <Link
          to="/meeting-creation"
          className="btn btn-outline-secondary btn-sm"
        >
          Back to List
        </Link>
      </div>

      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                  Meeting Topic <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  className="form-control"
                  placeholder="Enter Meeting Topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                />
                {errors.topic && (
                  <small className="text-danger">{errors.topic}</small>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Meeting Fee <span className="text-danger-600">*</span>
                </label>
                <input
                  type="number"
                  name="meetingFee"
                  className="form-control"
                  placeholder="Enter Meeting Fee"
                  value={formData.meetingFee}
                  onChange={handleInputChange}
                />
                {errors.meetingFee && (
                  <small className="text-danger">{errors.meetingFee}</small>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Visitor Fee <span className="text-danger-600">*</span>
                </label>
                <input
                  type="number"
                  name="visitorFee"
                  className="form-control"
                  placeholder="Enter Visitor Fee"
                  value={formData.visitorFee}
                  onChange={handleInputChange}
                />
                {errors.visitorFee && (
                  <small className="text-danger">{errors.visitorFee}</small>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Chapter's <span className="text-danger-600">*</span>
                </label>
                <Select
                  name="chapters"
                  options={chapterOptions}
                  value={chapterOptions.find((option) =>
                    formData.chapters.includes(option.value),
                  )}
                  onChange={handleSelectChange}
                  styles={selectStyles(errors.chapters)}
                  placeholder="Select Chapters"
                  isClearable={false}
                />
                {errors.chapters && (
                  <small className="text-danger">{errors.chapters}</small>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                  Hotel Name <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  name="hotelName"
                  className="form-control"
                  placeholder="Enter Hotel Name"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                />
                {errors.hotelName && (
                  <small className="text-danger">{errors.hotelName}</small>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                  Start Date & Time <span className="text-danger-600">*</span>
                </label>
                <StandardDatePicker
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  enableTime={true}
                  placeholder="DD/MM/YYYY HH:MM AM/PM"
                  minDate="today"
                />
                {errors.startDate && (
                  <small className="text-danger">{errors.startDate}</small>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                  End Date & Time <span className="text-danger-600">*</span>
                </label>
                <StandardDatePicker
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  enableTime={true}
                  placeholder="DD/MM/YYYY HH:MM AM/PM"
                  minDate={formData.startDate || "today"}
                />
                {errors.endDate && (
                  <small className="text-danger">{errors.endDate}</small>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                  Late Punch Date & Time <span className="text-danger-600">*</span>
                </label>
                <StandardDatePicker
                  name="latePunchTime"
                  value={formData.latePunchTime}
                  onChange={handleInputChange}
                  enableTime={true}
                  placeholder="DD/MM/YYYY HH:MM AM/PM"
                  minDate={formData.startDate || "today"}
                  maxDate={formData.endDate}
                />
                {errors.latePunchTime && (
                  <small className="text-danger">{errors.latePunchTime}</small>
                )}
              </div>
            </div>

            <div className="col-md-12">
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
                          onChange={handleInputChange}
                          ref={placeAutocompleteRef}
                          onBlur={() => {
                            // Delay to allow clicking the search icon or selection
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
                  <small className="text-danger">{errors.location}</small>
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

            <div className="col-12 mt-4 pt-4">
              <div className="d-flex justify-content-end gap-3">
                <Link
                  to="/meeting-creation"
                  className="btn btn-outline-secondary px-32 justify-content-center"
                >
                  Cancel
                </Link>
                {hasPermission("Meeting Creation", id ? "edit" : "add") && (
                  <button
                    type="submit"
                    className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                    style={{ width: "120px" }}>
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
    <MeetingFormLayer />
  </>
);
