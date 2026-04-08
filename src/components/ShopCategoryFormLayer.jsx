import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import ShopCategoryApi from "../Api/ShopCategoryApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import usePermissions from "../hook/usePermissions";

const ShopCategoryFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [savedImage, setSavedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        setLoading(true);
        const response = await ShopCategoryApi.getShopCategoryDetails(id);
        if (response.status) {
          const category = response.data.data || response.data;
          setFormData({
            name: category.name,
            isActive: category.isActive ? true : false,
          });

          if (category.categoryImage) {
            const imagePath = category.categoryImage?.path || category.categoryImage;
            setExistingImage(imagePath);
            setSavedImage(imagePath);
            setPreviewImage(`${IMAGE_BASE_URL}/${imagePath}`);
          }
        }
        setLoading(false);
      };
      fetchCategory();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      isActive: selectedOption ? selectedOption.value : true,
    }));
    setErrors((prev) => ({ ...prev, status: "" }));
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
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category Name is Required.";
    }
    if (formData.isActive === null || formData.isActive === undefined) {
      newErrors.status = "Status is Required.";
    }
    if (!previewImage && !existingImage) {
      newErrors.image = "Category Image is Required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    let finalImage = existingImage;

    if (imageFile) {
      const form = new FormData();
      form.append("file", imageFile);
      const uploadRes = await ImageUploadApi.uploadImage({
        formData: form,
        path: "shop-categories",
      });

      if (uploadRes.status) {
        finalImage = uploadRes.response.data || uploadRes.response;
      } else {
        setLoading(false);
        return;
      }
    }

    // Check for deletion of old image
    if (savedImage && finalImage !== savedImage) {
      await ImageUploadApi.deleteImage({ path: savedImage });
    }

    const payload = {
      name: formData.name,
      categoryImage: finalImage,
      isActive: formData.isActive,
    };

    let result;
    if (id) {
      result = await ShopCategoryApi.updateShopCategory(id, payload);
    } else {
      result = await ShopCategoryApi.createShopCategory(payload);
    }

    setLoading(false);
    if (result.status) {
      navigate("/shop-category-list");
    }
  };

  const handleRemoveImage = async () => {
    if (imageFile) {
      setImageFile(null);
      if (existingImage && existingImage.path) {
        setPreviewImage(`${IMAGE_BASE_URL}/${existingImage.path}`);
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

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {id ? "Edit Category" : "Create Category"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Category Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Category Name"
              />
              {errors.name && (
                <small className="text-danger">{errors.name}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Status <span className="text-danger">*</span>
              </label>
              <Select
                name="isActive"
                options={statusOptions}
                value={statusOptions.find(
                  (opt) => opt.value === formData.isActive,
                )}
                onChange={handleStatusChange}
                styles={selectStyles(errors.status)}
                isClearable={false}
              />
              {errors.status && (
                <small className="text-danger">{errors.status}</small>
              )}
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Category Image <span className="text-danger">*</span>
              </label>

              {!previewImage && !existingImage && !loading && (
                <div className="position-relative">
                  <input
                    type="file"
                    className="form-control radius-8"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {errors.image && (
                    <small className="text-danger">{errors.image}</small>
                  )}
                </div>
              )}

              {(previewImage || existingImage) && !loading && (
                <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light-600">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-100-px h-100-px rounded-8 overflow-hidden border">
                      <img
                        src={
                          previewImage ||
                          (existingImage
                            ? `${IMAGE_BASE_URL}/${existingImage.path}`
                            : "")
                        }
                        alt="Preview"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                    <div>
                      <p className="text-primary-600 mb-0 fw-medium">
                        {imageFile ? "New Image Selected" : "Uploaded Image"}
                      </p>
                      <p
                        className="text-secondary-400 text-sm mb-0 text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {imageFile
                          ? imageFile.name
                          : existingImage?.imageName ||
                          existingImage?.path?.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-primary-100 text-danger-600 rounded-circle"
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
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/shop-category-list"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            {hasPermission("Category List", id ? "edit" : "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-18 py-11 justify-content-center"
                disabled={loading}
                style={{
                  backgroundColor: "#003366",
                  borderColor: "#003366",
                  width: "120px",
                }}
              >
                {loading ? "Saving..." : id ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopCategoryFormLayer;
