import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import ImageUploadApi from "../Api/ImageUploadApi";
import BannerApi from "../Api/BannerApi";
import ShowNotifications from "../helper/ShowNotifications";
import { IMAGE_BASE_URL } from "../Config/Index";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableGalleryItem = ({ item, handleDeleteItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div
      className="col-xxl-4 col-xl-4 col-lg-4 col-md-6"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="card h-100 p-0 radius-12 overflow-hidden position-relative group">
        <div className="card-body p-0 position-relative">
          <img
            src={`${IMAGE_BASE_URL}/${item.bannerImage?.path || item.bannerImage || item.image || ""}`}
            alt={item.title || "Gallery Image"}
            className="w-100 object-fit-contain"
            style={{ height: "auto", cursor: "grab" }}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x300?text=No+Image";
            }}
          />
        </div>
        <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-primary-600 btn-sm d-flex align-items-center gap-2"
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => handleDeleteItem(item)}
          >
            <Icon icon="mingcute:delete-2-line" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const GalleryCreateLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [galleryList, setGalleryList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [link, setLink] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [savedImage, setSavedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      getGalleryDetails(id);
    }
    fetchGallery();
  }, [id]);

  const fetchGallery = async () => {
    const response = await BannerApi.getBanners({ page: 0, limit: 10 });
    if (response.status) {
      setGalleryList(response.response.data || []);
    }
  };

  const getGalleryDetails = async (galleryId) => {
    const response = await BannerApi.getBannerById(galleryId);

    if (response.status) {
      const data = response.response.data;

      setSavedImage(data.galleryImage);
      setLink(data.link || "");
      if (data.expiryDate) {
        setExpiryDate(new Date(data.expiryDate).toISOString().split('T')[0]);
      } else {
        setExpiryDate("");
      }

      let imgPath = "";
      if (data.galleryImage) {
        if (typeof data.galleryImage === "string") {
          imgPath = data.galleryImage;
        } else if (data.galleryImage.path) {
          imgPath = data.galleryImage.path;
        }
      }

      if (imgPath) {
        setImagePath(imgPath);
        setPreview(`${IMAGE_BASE_URL}/${imgPath}`);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileObj = e.target.files[0];
      setSelectedFile(fileObj);
      setPreview(URL.createObjectURL(fileObj));
      setErrors({ ...errors, image: "" });
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
      const response = await ImageUploadApi.deleteImage({ path: imagePath });
      if (response.status) {
        setImagePath("");
        setSavedImage(null);
        setPreview(null);
      }
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!imagePath && !selectedFile) {
      tempErrors.image = "Image is Required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsUploading(true);
    let finalImagePath = savedImage || imagePath;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const uploadResponse = await ImageUploadApi.uploadImage({
          formData,
          path: "gallery",
        });

        if (uploadResponse.status) {
          finalImagePath = uploadResponse.response.data;
        } else {
          setIsUploading(false);
          return;
        }
      } catch {
        setIsUploading(false);
        return;
      }
    }

    const payload = {
      galleryImage: finalImagePath,
      link: link,
      expiryDate: expiryDate || null,
    };

    let response;
    if (id) {
      response = await BannerApi.updateBanner({ ...payload, id });
    } else {
      // Assuming createBanner accepts valid payload
      response = await BannerApi.createBanner(payload);
    }

    setIsUploading(false);

    if (response.status) {
      // ShowNotifications.showAlertNotification(
      //   "Gallery saved successfully",
      //   "success",
      // );
      // If we are editing, maybe navigate back or stay?
      // User manual edit had: navigate("/gallery");
      // But if we are ON /gallery (which is likely where this component is),
      // navigation might be redundant or intended to clear params.
      // I will keep the navigation but also refresh the list if we are staying.
      if (!id) {
        // Reset form on create
        setSelectedFile(null);
        setPreview(null);
        setImagePath("");
        setLink("");
        setExpiryDate("");
        setSavedImage(null);
        fetchGallery();
      } else {
        navigate("/gallery");
      }
    }
  };

  const handleDeleteItem = async (item) => {
    console.log(item);
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );
    if (!isConfirmed) return;
    let imagePathToDelete = "";
    if (item.bannerImage) {
      if (typeof item.bannerImage === "string") {
        imagePathToDelete = item.bannerImage;
      } else if (item.bannerImage.path) {
        imagePathToDelete = item.bannerImage.path;
      }
    } else if (item.image) {
      imagePathToDelete = item.image;
    }
    console.log(imagePathToDelete, "dsaoihsfoa");
    if (imagePathToDelete) {
      const fileDeleteResponse = await ImageUploadApi.deleteImage({
        path: imagePathToDelete,
      });

    }
    const response = await BannerApi.deleteGallery(item._id);
    if (response.status) {
      fetchGallery();
    } else {
      ShowNotifications.showAlertNotification(
        "Failed to delete image",
        "error",
        "error"
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = galleryList.findIndex(item => item._id === active.id);
      const newIndex = galleryList.findIndex(item => item._id === over.id);

      const updatedList = arrayMove(galleryList, oldIndex, newIndex);
      setGalleryList(updatedList);

      const payload = {
        banners: updatedList.map((item, index) => ({
          id: item._id,
          order: index + 1,
        })),
      };

      try {
        const response = await BannerApi.updateBannerOrder(payload);
        if (response.status) {
          ShowNotifications.showAlertNotification(
            "Order updated successfully",
            "success"
          );
        } else {
          ShowNotifications.showAlertNotification(
            "Failed to update order",
            "error"
          );
          fetchGallery();
        }
      } catch (error) {
        ShowNotifications.showAlertNotification(
          "Failed to update order",
          "error"
        );
        fetchGallery();
      }
    }
  };

  return (
    <div className="row gy-4">
      <div className="col-12">
        <div className="card h-100 p-0 radius-12">
          <div className="card-header bg-transparent border-bottom">
            <h6 className="text-primary-600 pb-2 mb-0">
              {id ? "Edit Mobile Ad" : "Mobile Banner Ads"}
            </h6>
          </div>

          <div className="card-body p-24">
            <form onSubmit={handleSubmit}>
              <div className="row gy-3">
                <div className="col-12 my-3">
                  <label className="form-label">
                    Add Image <span className="text-danger-600">*</span>
                  </label>

                  {!imagePath && !selectedFile && !isUploading && (
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  )}

                  {errors.image && (
                    <p className="text-danger text-xs mt-1">
                      {errors.image}
                    </p>
                  )}

                  {isUploading && (
                    <div className="text-center">
                      <div className="spinner-border text-primary" />
                      <p className="mt-2">Uploading...</p>
                    </div>
                  )}

                  {(imagePath || selectedFile) && !isUploading && (
                    <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light-600">
                      <div className="d-flex align-items-center gap-3">
                        <div className="w-100-px h-100-px rounded-8 overflow-hidden border">
                          <img
                            src={preview || `${IMAGE_BASE_URL}/${imagePath}`}
                            className="w-100 h-100 object-fit-cover"
                            alt="Gallery Preview"
                          />
                        </div>
                        <div>
                          <p className="text-primary-600 mb-0 fw-medium">
                            {selectedFile
                              ? "New Image Selected"
                              : "Uploaded Image"}
                          </p>
                          <p className="text-secondary-400 text-sm mb-0">
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
                      >
                        <Icon icon="mingcute:delete-2-line" width="24" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label">
                    Redirect Link (Hyperlink)
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                  <p className="text-secondary-400 text-sm mt-1">
                    Banner will be automatically hidden after this date.
                  </p>
                </div>

                <div className="col-12 d-flex justify-content-end gap-3 mt-4">
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
      </div>

      <div className="col-12">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="row g-3">
            <SortableContext
              items={galleryList.map(item => item._id)}
              strategy={rectSortingStrategy}
            >
              {galleryList.map((item) => (
                <SortableGalleryItem
                  key={item._id}
                  item={item}
                  handleDeleteItem={handleDeleteItem}
                />
              ))}
            </SortableContext>
            {galleryList.length === 0 && (
              <div className="col-12">
                <div className="text-center py-5">
                  <p className="text-secondary-light">No gallery items found.</p>
                </div>
              </div>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default GalleryCreateLayer;
