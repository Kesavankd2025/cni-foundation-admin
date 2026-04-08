import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";

const ShopCreateLayer = () => {
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    category: "",
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is Required.";
    }
    if (!formData.price) {
      newErrors.price = "Price is Required.";
    }
    if (!formData.category) {
      newErrors.category = "Category is Required.";
    }
    if (!formData.image) {
      newErrors.image = "Product Image is Required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    console.log("Form Submitted:", formData);
  };

  const categoryOptions = [
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Accessories", label: "Accessories" },
    { value: "Home & Garden", label: "Home & Garden" },
  ];

  const getSelectedOption = (options, value) => {
    return options.find((option) => option.value === value) || null;
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">Add Product</h6>
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
                className="form-control radius-8"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
              />
              {errors.productName && (
                <small className="text-danger">{errors.productName}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Price <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-base text-secondary-light radius-8 border-end-0">
                  ₹
                </span>
                <input
                  type="number"
                  className="form-control radius-8"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <small className="text-danger">{errors.price}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Category <span className="text-danger">*</span>
              </label>
              <Select
                name="category"
                options={categoryOptions}
                value={getSelectedOption(categoryOptions, formData.category)}
                onChange={handleSelectChange}
                styles={selectStyles(errors.category)}
                placeholder="Select Category"
                isClearable={false}
              />
              {errors.category && (
                <small className="text-danger">{errors.category}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Product Image <span className="text-danger">*</span>
              </label>

              {!previewImage && (
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

              {previewImage && (
                <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light-600">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-100-px h-100-px rounded-8 overflow-hidden border">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div>
                      <p className="text-primary-600 mb-0 fw-medium">
                        New Image Selected
                      </p>
                      <p
                        className="text-secondary-400 text-sm mb-0 text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {formData.image?.name}
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
              to="/shop-list"
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
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopCreateLayer;
