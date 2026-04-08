import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class ImageUploadApi {
  async uploadImage(data) {
    try {
      const response = await apiClient.post(`/image/upload`, data.formData, {
        params: {
          path: data.path,
        },
      });

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Image upload failed. Please try again.";

      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, response: error };
    }
  }

  async deleteImage(data) {
    try {
      const response = await apiClient.delete(`/image/delete`, {
        params: {
          path: data.path,
        },
      });

      if (response.status === 200 || response.status === 201) {
        // ShowNotifications.showAlertNotification(
        //   response.data.message || "Image deleted successfully!",
        //   true,
        // );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Image delete failed. Please try again.";

      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, response: error };
    }
  }
}

export default new ImageUploadApi();
