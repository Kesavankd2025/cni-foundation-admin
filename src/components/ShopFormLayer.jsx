import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import ProductApi from "../Api/ProductApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import ShopCategoryApi from "../Api/ShopCategoryApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatErrorMessage } from "../helper/TextHelper";
import usePermissions from "../hook/usePermissions";

const ShopFormLayer = () => {
  const { hasPermission } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    categoryId: "",
    description: "",
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [savedImage, setSavedImage] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const promises = [ShopCategoryApi.getShopCategories()];
        if (id) {
          promises.push(ProductApi.getProductDetails(id));
        }

        const [catRes, productRes] = await Promise.all(promises);

        if (catRes && catRes.status) {
          const categories = catRes.data.data || catRes.data;
          if (Array.isArray(categories)) {
            const options = categories
              .filter((cat) => cat.isActive === true || cat.isActive === 1)
              .map((cat) => ({
                value: cat._id,
                label: cat.name,
              }));
            setCategoryOptions(options);
          }
        }

        if (id && productRes && productRes.status) {
          const product = productRes.data.data || productRes.data;
          setFormData({
            productName: product.productName,
            price: product.price,
            categoryId: product.categoryId?._id || product.categoryId,
            description: product.description,
            isActive: product.isActive,
          });

          if (product.productImage) {
            const imagePath = product.productImage?.path || product.productImage;
            setExistingImage(imagePath);
            setSavedImage(imagePath);
            setPreviewImage(`${IMAGE_BASE_URL}/${imagePath}`);
          }
        }
      } catch (error) {
        console.error("Error initializing shop form data", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      if (value < 0) {
        setErrors((prev) => ({ ...prev, price: "Price cannot be negative" }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedOption ? selectedOption.value : "",
    }));
    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: "" }));
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
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.productName.trim()) {
      newErrors.productName = formatErrorMessage("product name is required");
      isValid = false;
    }

    if (!formData.price) {
      newErrors.price = formatErrorMessage("price is required");
      isValid = false;
    } else if (Number(formData.price) < 0) {
      newErrors.price = formatErrorMessage("price cannot be negative");
      isValid = false;
    }

    if (!formData.categoryId) {
      newErrors.categoryId = formatErrorMessage("category is required");
      isValid = false;
    }

    if (!existingImage && !imageFile && !previewImage) {
      newErrors.image = formatErrorMessage("product image is required");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
        path: "products",
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
      productName: formData.productName,
      price: Number(formData.price),
      categoryId: formData.categoryId,
      productImage: finalImage,
      description: formData.description,
      isActive: formData.isActive ? true : false,
    };

    let result;
    if (id) {
      result = await ProductApi.updateProduct(id, payload);
    } else {
      result = await ProductApi.createProduct(payload);
    }

    setLoading(false);
    if (result.status) {
      navigate("/shop-create");
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

  const getSelectedOption = () => {
    return (
      categoryOptions.find((opt) => opt.value === formData.categoryId) || null
    );
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {id ? "Edit Product" : "Create Product"}
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Product Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control radius-8 ${errors.productName ? "is-invalid" : ""}`}
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter Product Name"
              />
              {errors.productName && (
                <div className="invalid-feedback text-danger">
                  {errors.productName}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Price <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className={`form-control radius-8 ${errors.price ? "is-invalid" : ""}`}
                  name="price"
                  min={1}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter Price"
                />
                {errors.price && (
                  <div className="invalid-feedback text-danger">
                    {errors.price}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Category <span className="text-danger">*</span>
              </label>
              <Select
                name="categoryId"
                options={categoryOptions}
                value={getSelectedOption()}
                onChange={handleSelectChange}
                styles={selectStyles(errors.categoryId)}
                placeholder={
                  categoryOptions.length > 0
                    ? "Select Category"
                    : "Loading Categories..."
                }
                isClearable={false}
              />
              {errors.categoryId && (
                <small className="text-danger">{errors.categoryId}</small>
              )}
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Product Image <span className="text-danger">*</span>
              </label>

              {!previewImage && !imageFile && !loading && (
                <div className="position-relative">
                  <input
                    type="file"
                    className={`form-control radius-8 ${errors.image ? "is-invalid" : ""}`}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {errors.image && (
                    <div className="invalid-feedback text-danger">
                      {errors.image}
                    </div>
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
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/100x100?text=Error";
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
                          : existingImage?.imageName || "product-image.png"}
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

            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control radius-8"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Product Description..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <Link
              to="/shop-create"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
            >
              Cancel
            </Link>
            {hasPermission("Create Product", id ? "edit" : "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
                disabled={loading}
                style={{ width: "120px" }}
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

export default ShopFormLayer;
