import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class ChiefGuestApi {
  async createChiefGuest(data) {
    try {
      const response = await apiClient.post(`/chief-guest/create`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chief Guest created successfully!",
          true,
        );
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Chief Guest.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }

  async updateChiefGuest(id, data) {
    try {
      const response = await apiClient.put(`/chief-guest/edit/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chief Guest updated successfully!",
          true,
        );
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update Chief Guest.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }

  async getChiefGuests(page, limit, search) {
    try {
      const response = await apiClient.get(
        `/chief-guest/list?page=${page}&limit=${limit}&search=${search || ""}`,
      );
      if (response.status === 200) {
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Chief Guests.";
      console.error(errorMessage);
      return { status: false, error: errorMessage };
    }
  }

  async getChiefGuestDetails(id) {
    try {
      const response = await apiClient.get(`/chief-guest/details/${id}`);
      if (response.status === 200) {
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Chief Guest details.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }

  async deleteChiefGuest(id) {
    try {
      const response = await apiClient.delete(`/chief-guest/delete/${id}`);
      if (response.status === 200) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chief Guest deleted successfully!",
          true,
        );
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete Chief Guest.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.patch(`/chief-guest/${id}/toggle-active`);
      if (response.status === 200) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chief Guest deleted successfully!",
          true,
        );
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete Chief Guest.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }
}

export default new ChiefGuestApi();
