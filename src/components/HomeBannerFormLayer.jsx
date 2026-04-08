import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import BannerApi from "../Api/BannerApi";
import ImageUploadApi from "../Api/ImageUploadApi";
import { IMAGE_BASE_URL } from "../Config/Index";

const HomeBannerFormLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    buttonLink: "",
    isActive: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchBannerDetails();
    }
  }, [id]);

  const fetchBannerDetails = async () => {
    try {
      const res = await BannerApi.getBannerById(id);
      if (res.status && res.response.data) {
        const data = res.response.data;
        setFormData({
          title: data.title || "",
          subTitle: data.subTitle || "",
          buttonLink: data.buttonLink || "",
          isActive: data.isActive
        });
        if (data.bannerImage) {
          setExistingImage(data.bannerImage);
        }
      }
    } catch (error) {
      console.error("Error fetching banner details", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bannerImageData = existingImage;

      // Upload new image if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        const uploadRes = await ImageUploadApi.uploadImage({
          formData: uploadFormData,
          path: "banners",
        });

        if (uploadRes.status) {
          bannerImageData = uploadRes.response.data;
        } else {
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        galleryImage: bannerImageData,
      };

      let response;
      if (isEdit) {
        response = await BannerApi.updateBanner({ ...payload, id });
      } else {
        response = await BannerApi.createBanner(payload);
      }

      if (response && response.status) {
        navigate("/home-banner-list");
      }
    } catch (error) {
      console.error("Error saving banner", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">
          {isEdit ? "Edit" : "Create"} Home Page Banner Management
        </h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Banner Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Banner Title"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Sub Title
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="subTitle"
                value={formData.subTitle}
                onChange={handleChange}
                placeholder="Enter Sub Title"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Button Link
              </label>
              <input
                type="text"
                className="form-control radius-8"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                placeholder="Enter Button Link (e.g. /about or https://google.com)"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Banner Image {!isEdit && <span className="text-danger">*</span>}
              </label>
              <input
                type="file"
                className="form-control radius-8"
                accept="image/*"
                onChange={handleImageChange}
                required={!isEdit && !existingImage}
              />
              {imagePreview ? (
                <div className="mt-8 position-relative" style={{ width: "fit-content" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-120-px h-120-px object-fit-cover radius-8 border"
                  />
                </div>
              ) : existingImage && (
                <div className="mt-8">
                  <img
                    src={`${IMAGE_BASE_URL}/${existingImage.path}`}
                    alt="Current"
                    className="w-120-px h-120-px object-fit-cover radius-8 border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
              style={{ width: "120px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary radius-8 px-20 py-11 justify-content-center"
              style={{ width: "120px" }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeBannerFormLayer;
