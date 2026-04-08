import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class CommunityApi {
  async getCommunityList(page, limit, type, chapterId, memberId, search) {
    try {
      const url = `/community/list?page=${page}&limit=${limit}&type=${type || ""}&search=${search || ""}${chapterId ? `&chapterId=${chapterId}` : ""}${memberId ? `&memberId=${memberId}` : ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Community Updates. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getCommunityResponseDetails(id) {
    try {
      const response = await apiClient.get(`/community/response-details/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Response Details. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.patch(`/community/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update status. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new CommunityApi();
