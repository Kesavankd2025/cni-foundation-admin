import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class MemberSuggestionApi {
  async getMemberSuggestions(params = {}) {
    try {
      const { page, limit, search } = params;
      const url = `/member-suggestions/list?page=${page}&limit=${limit}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Member Suggestions. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, response: error?.response?.data || error };
    }
  }
}

export default new MemberSuggestionApi();
