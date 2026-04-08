import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import usePermissions from "../hook/usePermissions";
import AwardApi from "../Api/AwardApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const AwardFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({});

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [savedImage, setSavedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      getAwardById(id);
    }
  }, [isEditMode, id]);

  const getAwardById = async (id) => {
    const response = await AwardApi.getAward(id);
    if (response && response.status && response.response.data) {
      const data = response.response.data;
      setFormData(data);
      if (data.image) {
        let imageObj;
        if (typeof data.image === "string") {
          const path = data.image;
          const fileName = path.split("/").pop();
          imageObj = {
            fileName: fileName,
            originalName: fileName,
            path: path,
          };
        } else {
          imageObj = data.image;
        }
        setSavedImage(imageObj);
        setImagePath(imageObj);
        if (imageObj?.path) {
          setPreview(`${IMAGE_BASE_URL}/${imageObj.path}`);
        }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    let tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = "Award Name is Required";
      isValid = false;
    }
    if (!imagePath && !selectedFile) {
      tempErrors.image = "Award Image is Required";
      isValid = false;
    }

    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...tempErrors }));
      return;
    }

    setIsUploading(true);
    let finalAwardImage = imagePath;

    // If existing image was removed/replaced
    if (imagePath === null) {
      finalAwardImage = {
        path: "",
        fileName: "",
        originalName: "",
      };
    }

    if (selectedFile) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedFile);

      try {
        const uploadResponse = await ImageUploadApi.uploadImage({
          formData: formDataUpload,
          path: "award",
        });

        if (uploadResponse.status) {
          finalAwardImage = uploadResponse.response.data;
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
    if (savedImage && savedImage.path && (!finalAwardImage || finalAwardImage.path !== savedImage.path)) {
      await ImageUploadApi.deleteImage({ path: savedImage.path });
    }

    const payload = {
      ...formData,
      image: finalAwardImage
    };

    if (isEditMode) {
      payload.id = id;
      const response = await AwardApi.updateAward(payload);
      if (response && response.status) {
        navigate("/award");
      }
    } else {
      const response = await AwardApi.createAward(payload);
      if (response && response.status) {
        navigate("/award");
      }
    }
    setIsUploading(false);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEditMode ? "Edit Award" : "Create Award"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            <div className="col-12">
              <label className="form-label fw-semibold">
                Award Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Award Name"
                required={false}
              />
              {errors.name && (
                <span className="text-danger text-xs mt-1">{errors.name}</span>
              )}
            </div>

            <div className="col-12 my-3">
              <label className="form-label">
                Award Image <span className="text-danger-600">*</span>
              </label>

              {!imagePath && !selectedFile && !isUploading && (
                <div className="position-relative">
                  <input
                    type="file"
                    className="form-control radius-8"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange(e);
                      setErrors((prev) => ({ ...prev, image: "" }));
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
                          : imagePath?.originalName || imagePath?.fileName || "award-image"}
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
          </div>
          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/award"
              className={`btn btn-outline-danger-600 px-32 radius-8 justify-content-center ${isUploading ? "disabled" : ""}`}
              style={{ width: "120px" }}
              tabIndex={isUploading ? -1 : undefined}
            >
              Cancel
            </Link>
            {hasPermission("Award", isEditMode ? "edit" : "add") && (
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
      </div>
    </div>
  );
};

export default AwardFormLayer;
