import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import usePermissions from "../hook/usePermissions";
import { selectStyles } from "../helper/SelectStyles";
import BadgeApi from "../Api/BadgeApi";
import ChapterApi from "../Api/ChapterApi";
import MemberApi from "../Api/MemberApi";

const BadgeAssignCreateLayer = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [assignType, setAssignType] = useState({
    value: "Member",
    label: "Member",
  });
  const [selectedAssignTo, setSelectedAssignTo] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [errors, setErrors] = useState({});

  // Options state
  const [badgeOptions, setBadgeOptions] = useState([]);

  useEffect(() => {
    fetchBadges();
  }, [assignType.value]);

  const fetchBadges = async () => {
    try {
      const res = await BadgeApi.getBadge(null, 0, 100, assignType.value);
      if (res.status) {
        setBadgeOptions(
          res.response.data.map((b) => ({
            value: b._id,
            label: b.name,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching badges", error);
    }
  };

  const loadChapterOptions = async (inputValue) => {
    try {
      const res = await ChapterApi.getChapter({
        search: inputValue,
      });
      if (res.status) {
        return res.response.data.map((c) => ({
          value: c._id,
          label: c.chapterName,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading chapters", error);
      return [];
    }
  };

  const loadMemberOptions = async (inputValue) => {
    try {
      const res = await MemberApi.getMembers({
        search: inputValue,
      });
      if (res.status) {
        const members = res.response.data.members || res.response.data;
        if (Array.isArray(members)) {
          return members.map((m) => ({
            value: m._id,
            label: `${m.fullName} - ${m.membershipId}-${m.phoneNumber}`,
          }));
        }
        return [];
      }
      return [];
    } catch (error) {
      console.error("Error loading members", error);
      return [];
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!selectedAssignTo) {
      tempErrors.assignTo = `Please Select a ${assignType.label}`;
      isValid = false;
    }

    if (!selectedBadge) {
      tempErrors.badge = "Please Select a Badge";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      assignTo: assignType.value.toUpperCase(),
      assignToId: selectedAssignTo.value,
      badgeId: selectedBadge.value,
    };

    const res = await BadgeApi.assignBadge(payload);

    if (res.status) {
      navigate("/badge/assign");
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">Assign Member Badge</h6>
        <Link to="/badge/assign" className="btn btn-outline-secondary btn-sm">
          Back to History
        </Link>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            <div className="col-12">
              <label className="form-label">
                Select Member <span className="text-danger-600">*</span>
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadMemberOptions}
                value={selectedAssignTo}
                onChange={(val) => {
                  setSelectedAssignTo(val);
                  setErrors({ ...errors, assignTo: "" });
                }}
                styles={selectStyles(!!errors.assignTo)}
                placeholder="Search Member..."
              />
              {errors.assignTo && (
                <p className="text-danger text-xs mt-1">
                  {errors.assignTo}
                </p>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">
                Select Badge <span className="text-danger-600">*</span>
              </label>
              <Select
                options={badgeOptions}
                value={selectedBadge}
                onChange={(val) => {
                  setSelectedBadge(val);
                  setErrors({ ...errors, badge: "" });
                }}
                styles={selectStyles(!!errors.badge)}
                placeholder="Search Badge..."
                isSearchable
              />
              {errors.badge && (
                <p className="text-danger text-xs mt-1">{errors.badge}</p>
              )}
            </div>

            <div className="col-12 d-flex justify-content-end gap-3 mt-7">
              <Link
                to="/badge/assign"
                className="btn btn-outline-danger-600 px-32 justify-content-center"
                style={{ width: "120px" }}
              >
                Cancel
              </Link>
              {hasPermission("Badge Creation", "add") && (
                <button
                  type="submit"
                  className="btn btn-primary-600 px-32 justify-content-center"
                  style={{ width: "120px" }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BadgeAssignCreateLayer;
