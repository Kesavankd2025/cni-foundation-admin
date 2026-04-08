import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import StandardDatePicker from "./StandardDatePicker";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import { useNavigate } from "react-router-dom";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import ChapterApi from "../Api/ChapterApi";
import MemberApi from "../Api/MemberApi";

const AttendanceFilter = ({ filters, setFilters, onFilterChange, onClear }) => {
  const navigate = useNavigate();
  const [zoneOptions, setZoneOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (filters.zone) {
      fetchRegions(filters.zone.value);
    } else {
      setRegionOptions([]);
      setChapterOptions([]);
      setMemberOptions([]);
    }
  }, [filters.zone]);

  useEffect(() => {
    if (filters.region) {
      fetchChapters(filters.region.value);
    } else {
      setChapterOptions([]);
      setMemberOptions([]);
    }
  }, [filters.region]);

  useEffect(() => {
    if (filters.chapter) {
      fetchMembers(filters.chapter.value);
    } else {
      setMemberOptions([]);
    }
  }, [filters.chapter]);

  const fetchZones = async () => {
    const response = await ZoneApi.getZone();
    if (response.status) {
      const data = response.response.data || response.response;
      if (Array.isArray(data)) {
        const options = data.map((zone) => ({
          value: zone._id,
          label: zone.name,
        }));
        setZoneOptions(options);
      }
    }
  };

  const fetchRegions = async (zoneId) => {
    const response = await RegionApi.getRegionByZone(zoneId);
    if (response.status) {
      const data = response.response.data || response.response;
      if (Array.isArray(data)) {
        const options = data.map((region) => ({
          value: region._id,
          label: region.region,
        }));
        setRegionOptions(options);
      }
    }
  };

  const fetchChapters = async (regionId) => {
    const response = await ChapterApi.getChapter({ regionId: regionId });
    if (response.status) {
      const options = response.response.data.map((chapter) => ({
        value: chapter._id,
        label: chapter.chapterName,
      }));
      setChapterOptions(options);
    }
  };

  const fetchMembers = async (chapterId) => {
    const response = await MemberApi.getMembersByChapter({
      chapterId: chapterId,
    });
    if (response.status && response.response.data) {
      const options = response.response.data.map((member) => ({
        value: member._id,
        label: member.fullName,
      }));
      setMemberOptions(options);
    }
  };

  const dateRangeOptions = [
    { value: "month", label: "Month wise" },
    { value: "custom", label: "Custom Range" },
  ];

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: currentYear, label: currentYear.toString() },
    { value: currentYear - 1, label: (currentYear - 1).toString() },
    { value: currentYear - 2, label: (currentYear - 2).toString() },
  ];

  const handleSubmit = () => {
    if (onFilterChange) {

    }
  };

  return (
    <div className="card-header border-bottom py-16 px-24" style={{ backgroundColor: "#fff", borderLeft: "4px solid #003366" }}>
      <div className="d-flex align-items-center justify-content-between mb-24">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-danger-focus p-8 radius-8 d-flex align-items-center justify-content-center">
            <Icon icon="solar:filter-bold-duotone" className="text-danger-600 text-2xl" />
          </div>
          <h6 className="text-primary-600 mb-0 fw-bold">Attendance Filters</h6>
        </div>
        <button
          onClick={onClear}
          className="btn d-flex align-items-center gap-2 radius-8 h-40-px text-nowrap fw-semibold"
          style={{
            color: "#fff",
            backgroundColor: "#003366",
            border: "1px solid #003366",
            boxShadow: "0 4px 12px rgba(0, 51, 102, 0.2)"
          }}
        >
          <Icon icon="solar:filter-remove-bold-duotone" fontSize={20} />
          Clear All Filters
        </button>
      </div>

      <div className="row gy-4">
        <div className="col-md-4">
          <label className="form-label fw-semibold">Zone</label>
          <Select
            options={zoneOptions}
            value={filters.zone}
            onChange={(opt) => {
              onFilterChange("zone", opt);
              if (!opt) {
                onFilterChange("region", null);
                onFilterChange("chapter", null);
                onFilterChange("member", null);
              }
            }}
            placeholder="Select Zone"
            styles={selectStyles()}
            classNamePrefix="select"
            isClearable={true}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Region</label>
          <Select
            options={regionOptions}
            value={filters.region}
            onChange={(opt) => {
              onFilterChange("region", opt);
              if (!opt) {
                onFilterChange("chapter", null);
                onFilterChange("member", null);
              }
            }}
            placeholder="Select Region"
            styles={selectStyles()}
            classNamePrefix="select"
            isDisabled={!filters.zone}
            isClearable={true}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Chapter</label>
          <Select
            options={chapterOptions}
            value={filters.chapter}
            onChange={(opt) => {
              onFilterChange("chapter", opt);
              if (!opt) {
                onFilterChange("member", null);
              }
            }}
            placeholder="Select Chapter"
            styles={selectStyles()}
            classNamePrefix="select"
            isDisabled={!filters.region}
            isClearable={true}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">Date Range</label>
          <Select
            options={dateRangeOptions}
            value={dateRangeOptions.find(
              (opt) => opt.value === filters.dateRangeFilter,
            )}
            onChange={(opt) => onFilterChange("dateRangeFilter", opt ? opt.value : null)}
            placeholder="Select Date Range"
            styles={selectStyles()}
            classNamePrefix="select"
            isClearable
          />
        </div>

        {filters.dateRangeFilter === "month" && (
          <>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Month</label>
              <Select
                options={monthOptions}
                value={
                  monthOptions.find((m) => m.value === filters.month?.value) ||
                  filters.month
                }
                onChange={(opt) => onFilterChange("month", opt)}
                styles={selectStyles()}
                classNamePrefix="select"
                isClearable
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Year</label>
              <Select
                options={yearOptions}
                value={
                  yearOptions.find((y) => y.value === filters.year?.value) ||
                  filters.year
                }
                onChange={(opt) => onFilterChange("year", opt)}
                styles={selectStyles()}
                classNamePrefix="select"
                isClearable
              />
            </div>
          </>
        )}

        {filters.dateRangeFilter === "custom" && (
          <>
            <div className="col-md-4">
              <label className="form-label fw-semibold">From Date</label>
              <StandardDatePicker
                name="fromDate"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">To Date</label>
              <StandardDatePicker
                name="toDate"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceFilter;
