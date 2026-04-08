import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Icon } from "@iconify/react";
import StarUpdateApi from "../Api/StarUpdateApi";
import StandardDatePicker from "./StandardDatePicker";
import ChapterApi from "../Api/ChapterApi";
import BusinessCategoryApi from "../Api/BusinessCategoryApi";
import ImageUploadApi from "../Api/ImageUploadApi"; // Added
import ShowNotifications from "../helper/ShowNotifications";
import { selectStyles } from "../helper/SelectStyles";
import TablePagination from "./TablePagination";
import { IMAGE_BASE_URL } from "../Config/Index";
import { getLocalDateForInput, formatDate } from "../helper/DateHelper";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const StarUpdateLayer = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    chapterId: "",
    categoryId: "",
    title: "",
    lastDate: "",
    details: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [savedImage, setSavedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dropdown Data
  const [chapterOptions, setChapterOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    fetchUpdates();
  }, [page, limit]);

  useEffect(() => {
    fetchChapters();
    fetchCategories();
  }, []);

  // --- Data Fetching ---
  const fetchUpdates = async () => {
    setLoading(true);
    const response = await StarUpdateApi.getStarHubUpdate({
      page: page + 1,
      limit: limit,
    });
    if (response.status) {
      setList(response.response.data || []);
      setTotalPages(response.response.totalPages || 0);
      setTotalRecords(response.response.total || 0);
    }
    setLoading(false);
  };

  const fetchChapters = async (search = "") => {
    const response = await ChapterApi.getChapter({
      page: 1,
      limit: 10,
      search: search,
    });
    if (response.status) {
      const options = response.response.data.map((item) => ({
        value: item._id,
        label: item.chapterName,
      }));
      setChapterOptions(options);
    }
  };

  const fetchCategories = async (search = "") => {
    const response = await BusinessCategoryApi.getBusinessCategory(
      null,
      1,
      10,
      search,
    );
    if (response.status) {
      const options = response.response.data.map((item) => ({
        value: item._id,
        label: item.name,
      }));
      setCategoryOptions(options);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setPage(0);
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : "",
    });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleChapterSearch = (inputValue) => {
    if (inputValue) fetchChapters(inputValue);
  };

  const handleCategorySearch = (inputValue) => {
    if (inputValue) fetchCategories(inputValue);
  };

  // Image Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileObj = e.target.files[0];
      setSelectedFile(fileObj);
      setPreview(URL.createObjectURL(fileObj));
      if (errors.image) setErrors({ ...errors, image: "" });
    }
  };

  const handleDeleteImage = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (imagePath) {
        setPreview(imagePath);
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

  const resetForm = () => {
    setFormData({
      id: null,
      chapterId: "",
      categoryId: "",
      title: "",
      lastDate: "",
      details: "",
      location: "",
    });
    setErrors({});
    setSelectedFile(null);
    setPreview(null);
    setImagePath("");
    setSavedImage(null);
    setIsUploading(false);
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.chapterId) tempErrors.chapterId = "Chapter is required";
    if (!formData.categoryId) tempErrors.categoryId = "Category is required";
    if (!formData.title) tempErrors.title = "Title is required";
    if (!formData.lastDate) tempErrors.lastDate = "Last Date is required";
    if (!formData.details) tempErrors.details = "Details are required";
    if (!formData.location) tempErrors.location = "Location is required";
    if (!imagePath && !selectedFile) tempErrors.image = "Image is required"; // Add image validation if mandatory, otherwise remove. Assuming mandatory based on user saying "exact one" like badge.

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setIsUploading(true); // Show uploading spinner if image is being uploaded

    let finalImagePath = imagePath;

    if (selectedFile) {
      const formDataImage = new FormData();
      formDataImage.append("file", selectedFile);

      try {
        // Assuming 'event' or generic path for star updates, or check BadgeCreateLayer path.
        // Badge used 'badge'. Let's use 'star-update' or similar if API supports, or default.
        // I will use 'star-update' as path.
        const uploadResponse = await ImageUploadApi.uploadImage({
          formData: formDataImage,
          path: "star-update",
        });

        if (uploadResponse.status) {
          finalImagePath = uploadResponse.response.data;
        } else {
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }
    }

    // Check for deletion of old image
    if (savedImage && finalImagePath !== savedImage) {
      await ImageUploadApi.deleteImage({ path: savedImage });
    }

    const payload = {
      chapterId: formData.chapterId,
      categoryId: formData.categoryId,
      title: formData.title,
      lastDate: formData.lastDate,
      details: formData.details,
      location: formData.location,
      image: finalImagePath, // Add image to payload. Ensure backend expects 'image'.
    };

    let response;
    if (formData.id) {
      response = await StarUpdateApi.updateStarHubUpdate({
        ...payload,
        id: formData.id,
      });
    } else {
      response = await StarUpdateApi.createStarHubUpdate(payload);
    }

    setIsSubmitting(false);
    setIsUploading(false);

    if (response.status) {
      ShowNotifications.showAlertNotification(
        response.response.message ||
        (formData.id
          ? "Update updated successfully"
          : "Update created successfully"),
        true,
      );
      resetForm();
      fetchUpdates();
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item._id,
      chapterId:
        typeof item.chapterId === "object"
          ? item.chapterId?._id
          : item.chapterId,
      categoryId:
        typeof item.categoryId === "object"
          ? item.categoryId?._id
          : item.categoryId,
      title: item.title,
      lastDate: getLocalDateForInput(item.lastDate),
      details: item.details,
      location: item.location,
    });

    // Handle Image
    setSavedImage(item.image);
    let imgPath = "";
    if (item.image) {
      if (typeof item.image === "string") {
        imgPath = item.image;
      } else if (item.image.path) {
        imgPath = item.image.path;
      }
    }
    if (imgPath) {
      setSavedImage(imgPath);
      setImagePath(imgPath);
      setPreview(`${IMAGE_BASE_URL}/${imgPath}`);
    } else {
      setImagePath("");
      setPreview(null);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      const response = await StarUpdateApi.statusUpdate(id);
      if (response.status) {
        fetchUpdates();
      }
    }
  };

  const handleToggleActive = async (id) => {
    const response = await StarUpdateApi.toggleActive(id);
    if (response.status) {
      fetchUpdates();
    }
  };

  return (
    <div className="row gy-4">
      {/* Form Section */}
      <div className="col-12">
        <div className="card h-100 p-0 radius-12">
          <div className="card-header bg-transparent border-bottom">
            <h6 className="text-primary-600 pb-2 mb-0">
              {formData.id ? "Edit CNI Update" : "Create CNI Update"}
            </h6>
          </div>
          <div className="card-body p-24">
            <form onSubmit={handleSubmit}>
              <div className="row gy-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Chapter <span className="text-danger-600">*</span>
                  </label>
                  <Select
                    name="chapterId"
                    options={chapterOptions}
                    value={chapterOptions.find(
                      (opt) => opt.value === formData.chapterId,
                    )}
                    onChange={handleSelectChange}
                    onInputChange={handleChapterSearch}
                    placeholder="Search & Select Chapter"
                    styles={selectStyles(errors.chapterId)}
                  />
                  {errors.chapterId && (
                    <p className="text-danger text-xs mt-1">
                      {errors.chapterId}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Category <span className="text-danger-600">*</span>
                  </label>
                  <Select
                    name="categoryId"
                    options={categoryOptions}
                    value={categoryOptions.find(
                      (opt) => opt.value === formData.categoryId,
                    )}
                    onChange={handleSelectChange}
                    onInputChange={handleCategorySearch}
                    placeholder="Search & Select Category"
                    styles={selectStyles(errors.categoryId)}
                  />
                  {errors.categoryId && (
                    <p className="text-danger text-xs mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Title <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter Title"
                  />
                  {errors.title && (
                    <p className="text-danger text-xs mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Last Date <span className="text-danger-600">*</span>
                  </label>
                  <StandardDatePicker
                    name="lastDate"
                    value={formData.lastDate}
                    onChange={handleInputChange}
                  />
                  {errors.lastDate && (
                    <p className="text-danger text-xs mt-1">
                      {errors.lastDate}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Location <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter Location"
                  />
                  {errors.location && (
                    <p className="text-danger text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Image Upload Section */}
                <div className="col-md-6">
                  <label className="form-label">
                    Image <span className="text-danger-600">*</span>
                  </label>
                  {!imagePath && !selectedFile && !isUploading && (
                    <div className="position-relative">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
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
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
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
                            src={preview || imagePath}
                            alt="Preview"
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.target.src =
                                "assets/images/user-grid/user-grid-img13.png";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-primary-600 mb-0 fw-medium">
                            {selectedFile
                              ? "New Image Selected"
                              : "Uploaded Image"}
                          </p>
                          <p
                            className="text-secondary-400 text-sm mb-0 text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {selectedFile
                              ? selectedFile.name
                              : imagePath.split("/").pop()}
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

                <div className="col-12">
                  <label className="form-label">
                    Details <span className="text-danger-600">*</span>
                  </label>
                  <textarea
                    name="details"
                    className="form-control"
                    rows="3"
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Enter Details"
                  />
                  {errors.details && (
                    <p className="text-danger text-xs mt-1">
                      {errors.details}
                    </p>
                  )}
                </div>

                <div className="col-12 d-flex justify-content-end gap-3 mt-4">
                  {formData.id && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-32 justify-content-center"
                      style={{ width: "120px" }}
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary-600 px-32 justify-content-center"
                    disabled={isSubmitting}
                    style={{ width: "120px" }}
                  >
                    {formData.id ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="col-12">
        <div className="card h-100 p-0 radius-12">
          <div className="card-header bg-transparent border-bottom">
            <h6 className="text-primary-600 pb-2 mb-0">CNI Updates List</h6>
          </div>
          <div className="card-body p-24">
            <div className="table-responsive">
              <table className="table table-borderless">
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Image</th>
                    <th scope="col">Chapter</th>
                    <th scope="col">Category</th>
                    <th scope="col">Location</th>
                    <th scope="col">Last Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.length > 0 ? (
                    list.map((item) => (
                      <tr key={item._id}>
                        <td>{item.title}</td>
                        <td>
                          <div className="w-50-px h-50-px rounded-circle overflow-hidden">
                            {item.image ? (
                              <img
                                src={`${IMAGE_BASE_URL}/${item.image.path || item.image}`}
                                alt="img"
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "assets/images/user-grid/user-grid-img13.png";
                                }}
                              />
                            ) : (
                              <div className="w-100 h-100 bg-neutral-200 d-flex align-items-center justify-content-center">
                                <Icon icon="ri:image-line" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {typeof item.chapterId === "object"
                            ? item.chapterId?.chapterName
                            : item.chapterId}
                        </td>
                        <td>
                          {typeof item.categoryId === "object"
                            ? item.categoryId?.name
                            : item.categoryId}
                        </td>
                        <td style={{ maxWidth: '150px' }}>
                          {(typeof item.location === "object" ? item.location?.name : item.location)?.length > 20 ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-location-${item._id}`}>
                                  {typeof item.location === "object" ? item.location?.name : item.location}
                                </Tooltip>
                              }
                            >
                              <span
                                className="d-inline-block text-truncate w-100"
                                style={{ cursor: "pointer" }}
                              >
                                {typeof item.location === "object" ? item.location?.name : item.location}
                              </span>
                            </OverlayTrigger>
                          ) : (
                            <span className="d-inline-block text-truncate w-100">
                              {typeof item.location === "object" ? item.location?.name : item.location}
                            </span>
                          )}
                        </td>
                        <td>{formatDate(item.lastDate)}</td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={item.isActive}
                              onChange={() => handleToggleActive(item._id)}
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              className="btn btn-icon btn-primary-50 text-primary-600 rounded-circle"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Icon icon="lucide:edit" width="20" height="20" />
                            </button>
                            <button
                              className="btn btn-icon btn-primary-50 text-danger-600 rounded-circle"
                              onClick={() => handleDelete(item._id)}
                              title="Delete"
                            >
                              <Icon
                                icon="mingcute:delete-2-line"
                                width="20"
                                height="20"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No updates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              rowsPerPage={limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              totalRecords={totalRecords}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarUpdateLayer;
