import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class AdminUserApi {
  async getAdminUser(id, currentPage, rowsPerPage, search) {
    if (typeof id === "object" && id !== null) {
      ({ id, currentPage, rowsPerPage, search } = id);
    }
    try {
      const url = id
        ? `adminUser/${id}`
        : `adminUser?page=${currentPage || 0}&limit=${rowsPerPage || 10}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Admin User(s). Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createAdminUser(data) {
    try {
      const response = await apiClient.post("/adminUser", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Admin User Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Admin User. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateAdminUser(data) {
    try {
      const id = data instanceof FormData ? data.get("id") : data.id;
      const response = await apiClient.put(`/adminUser/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message,
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Admin User. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteAdminUser(id) {
    try {
      const response = await apiClient.patch(`/adminUser/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Admin User Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Admin User. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new AdminUserApi();
