import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import StandardDatePicker from "./StandardDatePicker";
import AsyncSelect from "react-select/async";
import usePermissions from "../hook/usePermissions";
import { selectStyles } from "../helper/SelectStyles";
import MemberApi from "../Api/MemberApi";
import ChapterApi from "../Api/ChapterApi";
import RegionApi from "../Api/RegionApi";
import BusinessCategoryApi from "../Api/BusinessCategoryApi";
import AdminUserApi from "../Api/AdminUserApi";
import AwardApi from "../Api/AwardApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import RoleApi from "../Api/RoleApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatErrorMessage } from "../helper/TextHelper";

const MemberFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [regionOptions, setRegionOptions] = useState([]);
  const [businessCategoryOptions, setBusinessCategoryOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [awardOptions, setAwardOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [savedImage, setSavedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: "",
    fullName: "",
    email: "",
    companyName: "",
    phoneNumber: "", // Renamed from mobileNumber
    whatsappNumber: "",
    applicationNo: "",
    membershipId: "",
    region: null,
    chapter: null,
    position: "",
    businessCategory: null,
    referredBy: null,
    roleId: null,
    dob: "",
    anniversary: null,
    doorNo: "",
    oldNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    communicationConsent: false,
    annualFee: "",
    transactionId: "",
    gstNo: "",
    paymentMode: "",
    paymentDate: "",
    joiningDate: "",
    renewalDate: "",
    sendWelcomeSms: false,
    trainingYear: "",
    mrp: false,
    mtp: false,
    atp: false,
    trainings: [],
    awardSelected: null,
    tenure: "",
    awards: [],
    membershipType: "",
    isRenewalFieldsDisabled: false,
  });

  useEffect(() => {
    fetchStaticDropdownData();
    if (isEditMode) {
      fetchMemberDetails();
    } else {
      fetchMembershipId();
    }
  }, [isEditMode]);

  const fetchMembershipId = async () => {
    try {
      const res = await MemberApi.generateMembershipId();

      if (res.status) {
        setFormData((prev) => ({
          ...prev,
          membershipId: res.response.data.membershipId || res.response.data,
        }));
      }
    } catch (error) {
      console.error("Error generating membership ID", error);
    }
  };

  const fetchStaticDropdownData = async () => {
    try {
      const [regionRes, busCatRes, memberRes, roleRes, awardRes] = await Promise.all([
        RegionApi.getRegion(),
        BusinessCategoryApi.getBusinessCategory(null, 0, 0, ""),
        MemberApi.getReferredByMembers(),
        RoleApi.getRoles({ search: "", roleType: "memberRoles" }),
        AwardApi.getAward(null, 0, 0, ""),
      ]);

      if (regionRes.status) {
        setRegionOptions(
          regionRes.response.data.map((r) => ({
            value: r._id,
            label: r.region || r.name,
          })),
        );
      }

      if (busCatRes.status) {
        setBusinessCategoryOptions(
          busCatRes.response.data.map((b) => ({
            value: b._id,
            label: b.name,
          })),
        );
      }

      if (memberRes.status) {
        const mData = memberRes.response.data.docs || memberRes.response.data;
        setMemberOptions(
          (Array.isArray(mData) ? mData : []).map((m) => ({
            value: m._id,
            label: `${m.fullName || m.name} ${m.phoneNumber ? "- " + m.phoneNumber : ""}${m.membershipId ? " (" + m.membershipId + ")" : ""}`,
          })),
        );
      }

      if (roleRes.status) {
        const options = roleRes.response.data.map((r) => ({
          value: r._id,
          label: r.roleName || r.name,
        }));
        setRoleOptions(options);

        // Set default role to "Member" for new registrations
        if (!isEditMode) {
          const defaultRole = options.find(
            (r) =>
              r.label.toLowerCase() === "member" ||
              r.label.toLowerCase() === "default member",
          );
          if (defaultRole) {
            setFormData((prev) => ({ ...prev, roleId: defaultRole }));
          }
        }
      }

      if (awardRes.status) {
        setAwardOptions(
          awardRes.response.data.map((a) => ({
            value: a._id,
            label: a.name || a.title,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching static dropdown data", error);
    }
  };

  const loadChapterOptions = async (inputValue) => {
    try {
      const res = await ChapterApi.getChapter({
        page: 0,
        search: inputValue,
        regionId: formData.region,
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

  const loadBusinessCategoryOptions = async (inputValue) => {
    try {
      const res = await BusinessCategoryApi.getBusinessCategory(
        null,
        0,
        0,
        inputValue,
      );
      if (res.status) {
        return res.response.data.map((b) => ({
          value: b._id,
          label: b.name,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading categories", error);
      return [];
    }
  };

  const loadReferredByOptions = async (inputValue) => {
    try {
      const res = await AdminUserApi.getAdminUser(null, 0, 10, inputValue);
      if (res.status) {
        return res.response.data.map((u) => ({
          value: u._id,
          label: `${u.name || u.fullName || u.email}${u.phoneNumber ? " - " + u.phoneNumber : ""}`,
          phoneNumber: u.phoneNumber,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading users", error);
      return [];
    }
  };

  const loadRoleOptions = async (inputValue) => {
    try {
      const res = await RoleApi.getRoles({
        page: 0,
        search: inputValue,
        roleType: "memberRoles",
      });
      if (res && res.status && res.response && res.response.data) {
        return res.response.data.map((r) => ({
          value: r._id,
          label: r.roleName || r.name,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading roles", error);
      return [];
    }
  };
  const loadAwardOptions = async (inputValue) => {
    try {
      const res = await AwardApi.getAward(null, 0, 10, inputValue);
      if (res.status) {
        return res.response.data.map((a) => ({
          value: a._id,
          label: a.name || a.title || "Award",
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading awards", error);
      return [];
    }
  };

  const fetchMemberDetails = async () => {
    try {
      const res = await MemberApi.getMemberDetails(id);
      if (res.status) {
        const data = res.response.data;
        let imgPath = "";
        if (data.profileImage) {
          let imageObj = null;

          if (typeof data.profileImage === "string") {
            imageObj = { path: data.profileImage };
          } else {
            imageObj = data.profileImage;
          }

          setSavedImage(imageObj);   // store full object
          setImagePath(imageObj.path);
          setPreview(imageObj.path ? `${IMAGE_BASE_URL}/${imageObj.path}` : null);
        }
        if (imgPath) {
          setSavedImage(imgPath);
          setImagePath(imgPath);
          setPreview(`${IMAGE_BASE_URL}/${imgPath}`);
        }

        const regionObj =
          data.region && typeof data.region === "object"
            ? { value: data.region._id, label: data.region.region }
            : data.regionDetails
              ? {
                value: data.regionDetails._id,
                label: data.regionDetails.region,
              }
              : data.region
                ? { value: data.region, label: "Loading..." } // Fallback for ID string
                : null;

        let chapterObj = null;
        if (data.chapter) {
          if (typeof data.chapter === "object") {
            chapterObj = {
              value: data.chapter._id,
              label: data.chapter.chapterName,
            };
          } else {
            const chapRes = await ChapterApi.getChapter(data.chapter);
            if (chapRes.status) {
              const c = chapRes.response.data;
              chapterObj = { value: c._id, label: c.chapterName };
            } else {
              chapterObj = { value: data.chapter, label: "Unknown Chapter" };
            }
          }
        } else if (data.chapterDetails) {
          chapterObj = {
            value: data.chapterDetails._id,
            label: data.chapterDetails.chapterName,
          };
        }

        let busCatObj = null;
        if (data.businessCategory) {
          if (typeof data.businessCategory === "object") {
            busCatObj = {
              value: data.businessCategory._id,
              label: data.businessCategory.name,
            };
          } else {
            const busRes = await BusinessCategoryApi.getBusinessCategory(
              data.businessCategory,
            );
            if (busRes.status) {
              const b = busRes.response.data;
              busCatObj = { value: b._id, label: b.name };
            } else {
              busCatObj = { value: data.businessCategory, label: "Unknown Category" };
            }
          }
        } else if (data.businessCategoryDetails) {
          busCatObj = {
            value: data.businessCategoryDetails._id,
            label: data.businessCategoryDetails.name,
          };
        }

        let referredByObj = null;
        if (data.referredBy) {
          if (typeof data.referredBy === "object") {
            referredByObj = {
              value: data.referredBy._id,
              label: `${data.referredBy.fullName || data.referredBy.name || data.referredBy.membershipId}${data.referredBy.membershipId ? " (" + data.referredBy.membershipId + ")" : ""}`,
            };
          } else {
            // First, try searching in the referred-by list for consistency
            const memberListRes = await MemberApi.getReferredByMembers();
            if (memberListRes.status) {
              const mData = memberListRes.response.data.docs || memberListRes.response.data;
              const found = (Array.isArray(mData) ? mData : []).find(m => m._id === data.referredBy);
              if (found) {
                referredByObj = {
                  value: found._id,
                  label: `${found.fullName || found.name} ${found.phoneNumber ? "- " + found.phoneNumber : ""}${found.membershipId ? " (" + found.membershipId + ")" : ""}`,
                };
              }
            }

            // Fallback to direct member details
            if (!referredByObj) {
              const memberRes = await MemberApi.getMemberDetails(data._id);
              if (memberRes.status) {
                const m = memberRes.response.data;
                referredByObj = {
                  value: m._id,
                  label: `${m.fullName || m.name}${m.membershipId ? " (" + m.membershipId + ")" : ""}`,
                };
              }
            }

            // Secondary fallback for Admin users
            if (!referredByObj) {
              const adminRes = await AdminUserApi.getAdminUser(data._id);
              if (adminRes.status) {
                const u = adminRes.response.data;
                referredByObj = {
                  value: u._id,
                  label: `${u.name || u.fullName || u.email}${u.phoneNumber ? " - " + u.phoneNumber : ""}`,
                };
              }
            }

            // Final fallback if still null
            if (!referredByObj) {
              referredByObj = { value: data.referredBy, label: "Unknown Referrer" };
            }
          }
        }

        let roleObj = null;
        if (data.roleId) {
          if (typeof data.roleId === "object") {
            roleObj = {
              value: data.roleId._id,
              label: data.roleId.roleName || data.roleId.name,
            };
          } else {
            const roleRes = await RoleApi.getRoles({ search: "", roleType: "memberlist" }); // Search doesn't support ID, usually we have a getRole
            // If getRole exists in RoleApi, use it. Let's check RoleApi.
            const roleDetailRes = await RoleApi.getRole ? await RoleApi.getRole(data.roleId) : null;
            if (roleDetailRes && roleDetailRes.status) {
              const r = roleDetailRes.response.data;
              roleObj = { value: r._id, label: r.roleName || r.name };
            } else {
              roleObj = { value: data.roleId, label: "Unknown Role" };
            }
          }
        }

        setFormData((prev) => ({
          ...prev,
          profileImage: data.profileImage?.path || data.profileImage || "",
          fullName: data.fullName || "",
          email: data.email || "",
          companyName: data.companyName || "",
          phoneNumber: data.phoneNumber || "",
          applicationNo: data.applicationNo || "",
          membershipId: data.membershipId || "",
          region: data.region?._id || data.region || null,
          chapter: chapterObj,
          position: data.position || "",
          businessCategory: busCatObj,
          referredBy: referredByObj,
          roleId: roleObj,
          dob: data.dateOfBirth?.split("T")[0] || "",
          whatsappNumber: data.whatsappNumber || "",
          anniversary: data.anniversary?.split("T")[0] || null,
          doorNo: data.officeAddress?.doorNo || "",
          oldNo: data.officeAddress?.oldNo || "",
          street: data.officeAddress?.street || "",
          area: data.officeAddress?.area || "",
          city: data.officeAddress?.city || "",
          state: data.officeAddress?.state || "",
          pincode: data.officeAddress?.pincode || "",
          communicationConsent: data.isWantSmsEmailUpdates || false,
          annualFee: data.annualFee || "",
          paymentMode: data.paymentMode || "",
          transactionId: data.transactionId || "",
          paymentDate: data.paymentDate?.split("T")[0] || "",
          joiningDate: data.joiningDate?.split("T")[0] || "",
          renewalDate: data.renewalDate?.split("T")[0] || "",
          gstNo: data.gstNumber || "",
          sendWelcomeSms: data.sendWelcomeSms || false,

          trainingYear: data.trainingYear?.split("T")[0] || "",
          mrp: data.trainingTypes?.includes("MRP") || false,
          mtp: data.trainingTypes?.includes("MTP") || false,
          atp: data.trainingTypes?.includes("ATP") || false,
          trainings: data.trainings || [],

          tenure: data.tenure?.split("T")[0] || "",
          awardSelected: null,
          awards: data.awards || [],

          membershipType: data.clubMemberType || "",
          isRenewalFieldsDisabled: data.isRenewalFieldsDisabled !== undefined ? data.isRenewalFieldsDisabled : false,
        }));
      }
    } catch (error) {
      console.error("Error fetching member details", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "fullName") {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (name === "phoneNumber" || name === "whatsappNumber") {
      // Only allow numbers and max 10 digits
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length > 10) return;
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    if (name === "pincode") {
      // Only allow numbers and max 6 digits
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length > 6) return;
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    if (name === "annualFee") {
      // Prevent negative values
      if (value < 0) return;
    }

    if (name === "city" || name === "state") {
      // Only allow alphabets and spaces
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (name === "transactionId") {
      // Only allow alphanumeric characters
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    if (name === "gstNo") {
      // Alphanumeric and max 15 digits
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (cleaned.length > 15) return;
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto-update Renewal Date when Joining Date is selected (1 year later)
      if (name === "joiningDate" && value) {
        const parts = value.split("-"); // Assuming YYYY-MM-DD from the picker
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parts[1];
          const day = parts[2];
          updatedData.renewalDate = `${year + 1}-${month}-${day}`;
        }
      }

      return updatedData;
    });

    if (name === "joiningDate" || name === "renewalDate") {
      const currentJoining = name === "joiningDate" ? value : formData.joiningDate;
      const currentRenewal = (name === "joiningDate" && value)
        ? (function () {
          const parts = value.split("-");
          return parts.length === 3 ? `${parseInt(parts[0]) + 1}-${parts[1]}-${parts[2]}` : formData.renewalDate;
        })()
        : (name === "renewalDate" ? value : formData.renewalDate);

      const joinD = parseDateHelper(currentJoining);
      const renewD = parseDateHelper(currentRenewal);

      if (joinD && renewD && !isNaN(joinD.getTime()) && !isNaN(renewD.getTime())) {
        if (renewD <= joinD) {
          setErrors((prev) => ({
            ...prev,
            renewalDate: formatErrorMessage("Renewal Date must be after Joining Date"),
          }));
        } else {
          setErrors((prev) => ({ ...prev, renewalDate: "" }));
        }
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          email: formatErrorMessage(
            "Invalid Email Format (e.g., user@example.com)",
          ),
        }));
      }
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleRegionChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      region: selectedOption ? selectedOption.value : "",
      chapter: null,
    }));
  };
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      if (errors.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: "" }));
      }
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

    if (imagePath) {
      setImagePath("");
      setPreview(null);
    }
  };

  const [errors, setErrors] = useState({});

  const parseDateHelper = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;

    const dateStr = String(dateVal).trim();

    // Handle YYYY-MM-DD (standard picker format)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    // Handle DD/MM/YYYY or D/M/YYYY
    const dmhRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const match = dateStr.match(dmhRegex);
    if (match) {
      const d = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      // We assume DD/MM/YYYY as per the display format
      return new Date(y, m - 1, d);
    }

    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName)
      newErrors.fullName = formatErrorMessage("full name is required");

    if (
      formData.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = formatErrorMessage(
        "Invalid Email Format (e.g., user@example.com)",
      );
    }

    if (!formData.companyName)
      newErrors.companyName = formatErrorMessage("company name is required");

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = formatErrorMessage("phone number is required");
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = formatErrorMessage(
        "phone number must be 10 digits",
      );
    }

    if (!formData.whatsappNumber) {
      newErrors.whatsappNumber = formatErrorMessage("whatsapp number is required");
    } else if (formData.whatsappNumber.length !== 10) {
      newErrors.whatsappNumber = formatErrorMessage(
        "whatsapp number must be 10 digits",
      );
    }

    if (!formData.membershipId)
      newErrors.membershipId = formatErrorMessage("membership ID is required");
    if (!formData.applicationNo)
      newErrors.applicationNo = formatErrorMessage("application number is required");
    if (!formData.position)
      newErrors.position = formatErrorMessage("position is required");
    if (!formData.businessCategory) {
      newErrors.businessCategory = formatErrorMessage(
        "business category is required",
      );
    }
    if (!formData.roleId)
      newErrors.roleId = formatErrorMessage("member role is required");

    if (!formData.annualFee) {
      newErrors.annualFee = formatErrorMessage("annual fee is required");
    } else if (Number(formData.annualFee) < 0) {
      newErrors.annualFee = formatErrorMessage("annual fee cannot be negative");
    }

    if (formData.paymentMode !== "Cash" && !formData.transactionId)
      newErrors.transactionId = formatErrorMessage(
        "transaction ID is required",
      );

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[0-9A-Z]{1}[0-9A-Z]{1}$/;
    if (formData.gstNo && !gstRegex.test(formData.gstNo)) {
      newErrors.gstNo = formatErrorMessage("Enter a valid GST Number");
    }

    if (!formData.paymentMode)
      newErrors.paymentMode = formatErrorMessage("payment mode is required");
    if (!formData.paymentDate)
      newErrors.paymentDate = formatErrorMessage("payment date is required");
    if (!formData.joiningDate) {
      newErrors.joiningDate = formatErrorMessage("joining date is required");
    }

    if (!formData.renewalDate) {
      newErrors.renewalDate = formatErrorMessage("renewal date is required");
    } else {
      const joinD = parseDateHelper(formData.joiningDate);
      const renewD = parseDateHelper(formData.renewalDate);

      if (joinD && renewD && !isNaN(joinD.getTime()) && !isNaN(renewD.getTime())) {
        if (renewD <= joinD) {
          newErrors.renewalDate = formatErrorMessage(
            "Renewal Date must be after Joining Date",
          );
        }
      }
    }

    if (formData.pincode && formData.pincode.length !== 6) {
      newErrors.pincode = formatErrorMessage("pincode must be 6 digits");
    }

    // if (!formData.trainingYear)
    //   newErrors.trainingYear = formatErrorMessage("training date is required");


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
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
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedFile);
        const uploadData = {
          formData: formDataUpload,
          path: "member-profile",
        };
        try {
          const res = await ImageUploadApi.uploadImage(uploadData);
          if (res.status) {
            finalImageData = res.response.data;
          } else {
            setIsUploading(false);
            return;
          }
        } catch (error) {
          console.error("Image upload failed", error);
          setIsUploading(false);
          return;
        }
      }

      // Check for deletion of old image // Check for deletion of old image from server if it was replaced or removed
      if (
        savedImage &&
        savedImage.path &&
        (!finalImageData || finalImageData.path !== savedImage.path)
      ) {
        await ImageUploadApi.deleteImage({ path: savedImage.path });
      }

      const payload = {
        profileImage: finalImageData,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        companyName: formData.companyName,
        applicationNo: formData.applicationNo,
        membershipId: formData.membershipId,
        region: formData.region || null,
        chapter: formData.chapter?.value || null,
        position: formData.position,
        businessCategory: formData.businessCategory?.value || null,
        referredBy: formData.referredBy?.value || null,
        roleId: formData.roleId?.value || null,
        dateOfBirth: formData.dob,
        anniversary: formData.anniversary || null,
        officeAddress: {
          doorNo: formData.doorNo,
          oldNo: formData.oldNo,
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        isWantSmsEmailUpdates: formData.communicationConsent,
        annualFee: Number(formData.annualFee),
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId,
        paymentDate: formData.paymentDate,
        joiningDate: formData.joiningDate,
        renewalDate: formData.renewalDate,
        gstNumber: formData.gstNo,
        sendWelcomeSms: formData.sendWelcomeSms,
        trainingYear: formData.trainingYear,
        trainingTypes: [
          formData.mrp ? "MRP" : null,
          formData.mtp ? "MTP" : null,
          formData.atp ? "ATP" : null,
        ].filter(Boolean),
        trainings: formData.trainings,
        tenure: formData.tenure,
        awards: formData.awards,
        clubMemberType: formData.membershipType,
      };
      if (payload.referredBy === "None" || payload.referredBy === "")
        delete payload.referredBy;
      let res;
      if (isEditMode) {
        res = await MemberApi.updateMember(id, payload);
      } else {
        res = await MemberApi.createMember(payload);
      }
      setIsUploading(false);
      if (res.status) {
        navigate("/members-registration");
      }
    } else {
      window.scrollTo(0, 0);
    }
  };
  const handleAddAward = () => {
    if (formData.tenure && formData.awardSelected) {
      const newAward = {
        tenure: formData.tenure,
        award: formData.awardSelected.label,
      };
      setFormData((prev) => ({
        ...prev,
        awards: [...prev.awards, newAward],
        tenure: "",
        awardSelected: null,
      }));
    }
  };
  const handleRemoveAward = (index) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  };

  const paymentModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "UPI", label: "UPI" },
    { value: "Bank Transfer", label: "Bank Transfer" },
  ];

  const getSelectedOption = (options, value) => {
    return options.find((option) => option.value === value) || null;
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Member" : "Create Member"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4 mb-24">
            <div className="col-12">
              <h6 className="text-primary-600 pb-2 mb-3">Basic Information</h6>
            </div>

            <div className="col-12">
              <div className="row gy-4 align-items-start">
                {/* Profile Image Column */}
                <div className="col-xxl-3 col-xl-4 col-lg-4 text-center">
                  <div
                    className="upload-image-app-icon rounded-12 overflow-hidden position-relative mx-auto mb-16 border border-neutral-200"
                    style={{
                      width: "160px",
                      height: "160px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {preview || imagePath ? (
                      <img
                        src={preview || imagePath}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          setPreview(null);
                          if (!selectedFile) setImagePath("");
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-secondary-light">
                        <Icon icon="solar:user-bold" className="text-7xl opacity-25" />
                      </div>
                    )}
                    {isUploading && (
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                        style={{ zIndex: 2 }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="d-flex justify-content-center gap-2">
                    <label
                      className="btn btn-outline-primary btn-sm radius-8 px-20"
                      htmlFor="profileImageUpload"
                    >
                      Choose
                    </label>
                    {/* {(preview || imagePath) && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm radius-8"
                        onClick={handleDeleteImage}
                      >
                        <Icon icon="mingcute:delete-2-line" />
                      </button>
                    )} */}
                  </div>
                  <input
                    type="file"
                    id="profileImageUpload"
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>

                {/* Top 6 Fields (3-column Grid) */}
                <div className="col-xxl-9 col-xl-8 col-lg-8">
                  <div className="row gy-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control h-48-px radius-8 ${errors.fullName ? "border-danger" : ""}`}
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter Full Name"
                      />
                      {errors.fullName && (
                        <div className="text-danger text-xs mt-1">
                          {errors.fullName}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={`form-control h-48-px radius-8 ${errors.email ? "border-danger" : ""}`}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter Email Address"
                      />
                      {errors.email && (
                        <div className="text-danger text-xs mt-1">
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control h-48-px radius-8 ${errors.phoneNumber ? "border-danger" : ""}`}
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter Phone Number"
                      />
                      {errors.phoneNumber && (
                        <div className="text-danger text-xs mt-1">
                          {errors.phoneNumber}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        WhatsApp Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control h-48-px radius-8 ${errors.whatsappNumber ? "border-danger" : ""}`}
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        placeholder="Enter WhatsApp Number"
                      />
                      {errors.whatsappNumber && (
                        <div className="text-danger text-xs mt-1">
                          {errors.whatsappNumber}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control h-48-px radius-8 ${errors.companyName ? "border-danger" : ""}`}
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter Company Name"
                      />
                      {errors.companyName && (
                        <div className="text-danger text-xs mt-1">
                          {errors.companyName}
                        </div>
                      )}
                    </div>



                    {/* <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <StandardDatePicker
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className={`form-control h-48-px radius-8 ${errors.dob ? "border-danger" : ""}`}
                      />
                      {errors.dob && (
                        <div className="text-danger text-xs mt-1">{errors.dob}</div>
                      )}
                    </div> */}
                    {/* Position */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Position <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control h-48-px radius-8 ${errors.position ? "border-danger" : ""}`}
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder="Enter Position"
                      />
                      {errors.position && (
                        <div className="text-danger text-xs mt-1">{errors.position}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Application Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control h-48-px radius-8 ${errors.applicationNo ? "border-danger" : ""}`}
                        name="applicationNo"
                        value={formData.applicationNo}
                        onChange={handleChange}
                        placeholder="Enter Application Number"
                      />
                      {errors.applicationNo && (
                        <div className="text-danger text-xs mt-1">
                          {errors.applicationNo}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Bottom Fields (3-column Grid) */}
                <div className="col-12">
                  <div className="row gy-4">
                    {/* Region */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">Region</label>
                      <Select
                        name="region"
                        options={regionOptions}
                        value={getSelectedOption(
                          regionOptions,
                          formData.region,
                        )}
                        onChange={handleRegionChange}
                        styles={selectStyles(errors.region)}
                        placeholder="Select Region"
                        isSearchable
                        isClearable
                      />
                      {errors.region && (
                        <div className="text-danger text-xs mt-1">
                          {errors.region}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">Chapter</label>
                      <AsyncSelect
                        key={formData.region}
                        name="chapter"
                        cacheOptions
                        defaultOptions
                        loadOptions={loadChapterOptions}
                        value={formData.chapter}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, chapter: val }))
                        }
                        styles={selectStyles(errors.chapter)}
                        placeholder="Select Chapter"
                        isSearchable
                        isClearable
                      />
                      {errors.chapter && (
                        <div className="text-danger text-xs mt-1">
                          {errors.chapter}
                        </div>
                      )}
                    </div>

                    {/* Position */}
                    {/* <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Position <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control radius-8"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                      />
                      {errors.position && (
                        <div  className="text-danger text-xs mt-1">
                          {errors.position}
                        </div>
                      )}
                    </div> */}

                    {/* Business Category */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Business Category <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="businessCategory"
                        options={businessCategoryOptions}
                        value={formData.businessCategory}
                        onChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            businessCategory: val,
                          }))
                        }
                        styles={selectStyles(errors.businessCategory)}
                        placeholder="Select Category"
                        isSearchable
                        isClearable
                      />
                      {errors.businessCategory && (
                        <div className="text-danger text-xs mt-1">
                          {errors.businessCategory}
                        </div>
                      )}
                    </div>

                    {/* Referred By */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Referred By
                      </label>
                      <Select
                        name="referredBy"
                        options={memberOptions}
                        value={formData.referredBy}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, referredBy: val }))
                        }
                        styles={selectStyles()}
                        placeholder="Select Member..."
                        isSearchable
                        isClearable
                      />
                    </div>

                    {/* Member Role */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Member Role <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="roleId"
                        options={roleOptions}
                        value={formData.roleId}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, roleId: val }))
                        }
                        styles={selectStyles(errors.roleId)}
                        placeholder="Select Role"
                        isSearchable
                        isClearable
                      />
                      {errors.roleId && (
                        <div className="text-danger text-xs mt-1">
                          {errors.roleId}
                        </div>
                      )}
                    </div>

                    {/* DOB */}
                    {/* <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <StandardDatePicker
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className={`form-control radius-8 ${errors.dob ? "border-danger" : ""}`}
                      />
                      {errors.dob && (
                        <div  className="text-danger text-xs mt-1">
                          {errors.dob}
                        </div>
                      )}
                    </div> */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Date of Birth
                      </label>
                      <StandardDatePicker
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="form-control h-48-px radius-8"
                        maxDate="today"
                      />
                    </div>
                    {/* Anniversary */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                        Anniversary
                      </label>
                      <StandardDatePicker
                        name="anniversary"
                        value={formData.anniversary}
                        onChange={handleChange}
                        className="form-control h-48-px radius-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. OFFICE ADDRESS */}
          <div className="row gy-3 mb-24">
            <div className="col-12">
              <h6 className="text-primary-600 pb-2 mb-3">Office Address</h6>
            </div>
            {/* Same address fields as before */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Door No (New No)</label>
              <input
                type="text"
                className="form-control radius-8"
                name="doorNo"
                value={formData.doorNo}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Old No</label>
              <input
                type="text"
                className="form-control radius-8"
                name="oldNo"
                value={formData.oldNo}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Street</label>
              <input
                type="text"
                className="form-control radius-8"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Area</label>
              <input
                type="text"
                className="form-control radius-8"
                name="area"
                value={formData.area}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">City</label>
              <input
                type="text"
                className="form-control radius-8"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">State</label>
              <input
                type="text"
                className="form-control radius-8"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Pincode</label>
              <input
                type="text"
                className={`form-control radius-8 ${errors.pincode ? "border-danger" : ""}`}
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                inputMode="numeric"
              />
              {errors.pincode && (
                <div className="text-danger text-xs mt-1">{errors.pincode}</div>
              )}
            </div>
          </div>

          {/* 3. CONSENT & SUBSCRIPTION */}
          <div className="row gy-3 mb-24">
            <div className="col-12">
              <div className="form-check d-flex align-items-center">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="communicationConsent"
                  id="communicationConsent"
                  checked={formData.communicationConsent}
                  onChange={handleChange}
                />
                <label
                  className="form-check-label fw-semibold"
                  htmlFor="communicationConsent"
                >
                  I wish to receive updates via SMS and E-Mail
                </label>
              </div>
            </div>
          </div>

          <div className="row gy-3 mb-24">
            <div className="col-12">
              <h6 className="text-primary-600 pb-2 mb-3">
                Subscription Details
              </h6>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                Joining Date <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                disabled={formData.isRenewalFieldsDisabled}
              />
              {errors.joiningDate && (
                <div className="text-danger text-xs mt-1">
                  {errors.joiningDate}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Annual Fee <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control radius-8 ${errors.annualFee ? "border-danger" : ""}`}
                name="annualFee"
                value={formData.annualFee}
                onChange={handleChange}
                min="0"
                disabled={formData.isRenewalFieldsDisabled}
              />
              {errors.annualFee && (
                <div className="text-danger text-xs mt-1">
                  {errors.annualFee}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                Payment Date <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                disabled={formData.isRenewalFieldsDisabled}
              />
              {errors.paymentDate && (
                <div className="text-danger text-xs mt-1">
                  {errors.paymentDate}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Payment Mode <span className="text-danger">*</span>
              </label>
              <Select
                name="paymentMode"
                options={paymentModeOptions}
                value={getSelectedOption(
                  paymentModeOptions,
                  formData.paymentMode,
                )}
                onChange={(opt) => {
                  setFormData((prev) => ({
                    ...prev,
                    paymentMode: opt ? opt.value : "",
                  }));
                  if (errors.paymentMode)
                    setErrors((prev) => ({ ...prev, paymentMode: "" }));
                }}
                isDisabled={formData.isRenewalFieldsDisabled}
                styles={selectStyles(errors.paymentMode)}
                placeholder="Select Mode"
                isClearable={false}
              />
              {errors.paymentMode && (
                <div className="text-danger text-xs mt-1">
                  {errors.paymentMode}
                </div>
              )}
            </div>
            {
              formData.paymentMode !== "Cash" && (
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Transaction ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control radius-8"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    disabled={formData.isRenewalFieldsDisabled}
                  />
                  {errors.transactionId && (
                    <div className="text-danger text-xs mt-1">
                      {errors.transactionId}
                    </div>
                  )
                  }
                </div>
              )}
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                GST No
              </label>
              <input
                type="text"
                className={`form-control radius-8 ${errors.gstNo ? "border-danger" : ""}`}
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                placeholder="15-char GST Number"
              />
              {errors.gstNo && (
                <div className="text-danger text-xs mt-1">{errors.gstNo}</div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                Renewal Date <span className="text-danger">*</span>
              </label>
              <StandardDatePicker
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                disabled={formData.isRenewalFieldsDisabled}
                minDate={
                  !isEditMode ? formData.joiningDate || "today" : undefined
                }
              />
              {errors.renewalDate && (
                <div className="text-danger text-xs mt-1">
                  {errors.renewalDate}
                </div>
              )}
            </div>
            <div className="col-12">
              <div className="form-check d-flex align-items-center">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="sendWelcomeSms"
                  id="sendWelcomeSms"
                  checked={formData.sendWelcomeSms}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="sendWelcomeSms">
                  Send Welcome SMS
                </label>
              </div>
            </div>
          </div>

          {/* 4. TRAINING REPORT */}
          <div className="row gy-4 mb-24">
            <div className="col-12">
              <h6 className="text-primary-600 pb-2 mb-3">Training Report</h6>
              <div className="row gy-3 gx-4 align-items-center">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary-light text-sm mb-8">
                    Training Date
                  </label>
                  <StandardDatePicker
                    name="trainingYear"
                    value={formData.trainingYear}
                    onChange={handleChange}
                  />
                  {errors.trainingYear && (
                    <div className="text-danger text-xs mt-1">
                      {errors.trainingYear}
                    </div>
                  )}
                </div>
                <div className="col-md-6 mt-4">
                  <div className="d-flex gap-4 mt-5">
                    <div className="form-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="mrp"
                        id="mrp"
                        checked={formData.mrp}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="mrp">
                        MRP
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="mtp"
                        id="mtp"
                        checked={formData.mtp}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="mtp">
                        MTP
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="atp"
                        id="atp"
                        checked={formData.atp}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="atp">
                        ATP
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. AWARDS REPORT */}
            <div className="col-12">
              <h6 className="text-primary-600 pb-2 mb-3">Add Awards Report</h6>

              {/* List of Added Awards */}
              {
                formData.awards.length > 0 && (
                  <div className="table-responsive mb-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Tenure</th>
                          <th>Award</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.awards.map((itm, idx) => (
                          <tr key={idx}>
                            <td>{itm.tenure}</td>
                            <td>{itm.award}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleRemoveAward(idx)}
                              >
                                <Icon icon="fluent:delete-24-regular" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }

              <div className="row gy-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary-light text-sm mb-8">Tenure Date</label>
                  <StandardDatePicker
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Choose Award</label>
                  <Select
                    name="awardSelected"
                    options={awardOptions}
                    value={formData.awardSelected}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, awardSelected: val }))
                    }
                    styles={selectStyles()}
                    placeholder="Select Award"
                    isSearchable
                    isClearable={false}
                  />
                </div>
                <div className="col-md-12 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm radius-8"
                    onClick={handleAddAward}
                  >
                    Add Award
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. CLUB MEMBER */}
          <div className="row gy-3 mb-24">
            <div className="col-12">
              <h6 className="text-primary-600 border-bottom border-primary-100 pb-2 mb-3">
                CNI Club Member
              </h6>
              <p className="text-primary-600 pb-2 mb-3">
                Select Membership Type
              </p>
            </div>
            <div className="col-12">
              <div className="d-flex flex-wrap gap-24 align-items-center">
                {["Gold", "Diamond", "Platinum"].map((type) => (
                  <div
                    className="d-flex align-items-center gap-10 cursor-pointer pe-12"
                    key={type}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        membershipType: prev.membershipType === type ? "" : type,
                      }))
                    }
                  >
                    <div
                      className={`w-36-px h-36-px d-flex align-items-center justify-content-center radius-10 transition-all ${formData.membershipType === type
                        ? "bg-danger-100 border border-danger-200"
                        : "bg-neutral-100 border border-neutral-200"
                        }`}
                    >
                      <div
                        className={`w-24-px h-24-px d-flex align-items-center justify-content-center radius-6 transition-all ${formData.membershipType === type
                          ? "bg-danger-600 shadow-sm"
                          : "bg-white border border-neutral-300"
                          }`}
                      >
                        {formData.membershipType === type && (
                          <Icon
                            icon="fa6-solid:check"
                            className="text-white fontsize-12"
                          />
                        )}
                      </div>
                    </div>
                    <span
                      className={`fontsize-13 fw-bold transition-all ${formData.membershipType === type
                        ? "text-primary-light"
                        : "text-secondary-light"
                        }`}
                    >
                      {type} Member
                    </span>
                  </div>
                ))}

                {/* <button
                  type="button"
                  className="text-danger border-0 bg-transparent ms-auto fontsize-11 fw-bold"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, membershipType: "" }))
                  }
                >
                  Reset Selection
                </button> */}
              </div>
              {errors.membershipType && (
                <div className="text-danger text-xs mt-1 d-block">
                  {errors.membershipType}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/members-registration"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
              style={{ width: "120px" }}
            >
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberFormLayer;
