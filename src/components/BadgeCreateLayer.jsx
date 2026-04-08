import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import ImageUploadApi from "../Api/ImageUploadApi";
import BadgeApi from "../Api/BadgeApi";
import ShowNotifications from "../helper/ShowNotifications";
import { IMAGE_BASE_URL } from "../Config/Index";
const BadgeCreateLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [savedImage, setSavedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const [type, setType] = useState({ value: "Member", label: "Member" });
  const [name, setName] = useState("");

  useEffect(() => {
    if (id) {
      getBadgeDetails(id);
    }
  }, [id]);

  const getBadgeDetails = async (badgeId) => {
    const response = await BadgeApi.getBadge(badgeId);
    if (response.status) {
      const data = response.response.data;
      setName(data.name);
      if (data.type) {
        setType({ value: data.type, label: data.type });
      }

      if (data.badgeImage) {
        let imageObj;
        if (typeof data.badgeImage === "string") {
          const path = data.badgeImage;
          const fileName = path.split("/").pop();
          imageObj = {
            fileName: fileName,
            originalName: fileName,
            path: path,
          };
        } else {
          imageObj = data.badgeImage;
        }

        setSavedImage(imageObj);
        setImagePath(imageObj);
        setPreview(`${IMAGE_BASE_URL}/${imageObj.path}`);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileObj = e.target.files[0];
      setSelectedFile(fileObj);
      setPreview(URL.createObjectURL(fileObj));
    }
  };

  const handleDeleteImage = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (imagePath && imagePath.path) {
        setPreview(`${IMAGE_BASE_URL}/${imagePath.path}`);
      } else {
        setPreview(null);
      }
      return;
    }

    if (imagePath) {
      setImagePath(null);
      setPreview(null);
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!name.trim()) {
      tempErrors.name = "Badge Name is Required";
      isValid = false;
    }

    if (!imagePath && !selectedFile) {
      tempErrors.image = "Badge Image is Required";
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

    setIsUploading(true);
    let finalBadgeImage = imagePath;

    // If existing image was removed/replaced
    if (imagePath === null) {
      finalBadgeImage = {
        path: "",
        fileName: "",
        originalName: "",
      };
    }

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const uploadResponse = await ImageUploadApi.uploadImage({
          formData: formData,
          path: "badge",
        });

        if (uploadResponse.status) {
          finalBadgeImage = uploadResponse.response.data;
        } else {
          setIsUploading(false);
          return;
        }
      } catch (error) {
        setIsUploading(false);
        console.error("Image upload failed:", error);
        return;
      }
    }

    // Check for deletion of old image from server
    if (savedImage && savedImage.path && (!finalBadgeImage || finalBadgeImage.path !== savedImage.path)) {
      await ImageUploadApi.deleteImage({ path: savedImage.path });
    }

    const badgeData = {
      type: type ? type.value : "Member",
      name,
      badgeImage: finalBadgeImage,
      // fileName: finalBadgeImage?.fileName || "",
      // originalName: finalBadgeImage?.originalName || "",
      // path: finalBadgeImage?.path || "",
    };

    let response;
    if (id) {
      response = await BadgeApi.updateBadge({ ...badgeData, id });
    } else {
      response = await BadgeApi.createBadge(badgeData);
    }

    setIsUploading(false);

    if (response.status) {
      navigate("/badge");
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header bg-transparent border-bottom">
        <h6 className="text-primary-600 pb-2 mb-0">
          {type?.value?.toLowerCase() === "chapter"
            ? "Edit Chapter Badge"
            : id
              ? "Edit Member Badge"
              : "Add Member Badge"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            <div className="col-12">
              <label className="form-label">
                Badge Name <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Badge Name"
                value={name}
                disabled={type?.value?.toLowerCase() === "chapter"}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: "" });
                }}
              />
              {errors.name && (
                <p className="text-danger text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="col-12 my-3">
              <label className="form-label">
                Badge Image <span className="text-danger-600">*</span>
              </label>

              {!imagePath && !selectedFile && !isUploading && (
                <div className="position-relative">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange(e);
                      setErrors({ ...errors, image: "" });
                    }}
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
                        src={preview || (imagePath?.path ? `${IMAGE_BASE_URL}/${imagePath.path}` : "")}
                        alt="Preview"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => { }}
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
                          : imagePath?.originalName || imagePath?.fileName || "badge-image"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-primary-100 text-danger-600 rounded-circle"
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

            <div className="col-12 d-flex justify-content-end gap-3 mt-4">
              <Link
                to="/badge"
                className="btn btn-outline-danger-600 px-32 justify-content-center"
                style={{ width: "120px" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary-600 px-32 justify-content-center"
                disabled={isUploading}
                style={{ width: "120px" }}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BadgeCreateLayer;
