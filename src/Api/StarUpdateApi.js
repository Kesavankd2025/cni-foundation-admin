import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class StarUpdateApi {
  async createStarHubUpdate(data) {
    try {
      const response = await apiClient.post("/star-update", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "CNI Update created successfully!",
          "success",
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create update.";
      ShowNotifications.showAlertNotification(errorMessage, "error");
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getStarHubUpdate(currentPage, rowsPerPage, search) {
    if (typeof currentPage === "object" && currentPage !== null) {
      ({ currentPage, rowsPerPage, search } = currentPage);
    }
    try {
      const url = `star-update?page=${currentPage || 0}&limit=${rowsPerPage || 10}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getStarHubUpdateById(id) {
    if (typeof id === "object" && id !== null) {
      ({ id } = id);
    }
    try {
      const response = await apiClient.get(`/star-update/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async updateStarHubUpdate(data) {
    try {
      const response = await apiClient.put(`/star-update/${data.id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "CNI Update updated successfully!",
          "success",
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to update.";
      ShowNotifications.showAlertNotification(errorMessage, "error");
      return { status: false, response: error?.response?.data || error };
    }
  }

  async deleteStarHubUpdate(id) {
    try {
      const response = await apiClient.delete(`/star-update/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Deleted successfully!",
          "success",
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to delete.";
      ShowNotifications.showAlertNotification(errorMessage, "error");
      return { status: false, response: error?.response?.data || error };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.patch(`/star-update/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Deleted successfully!",
          "success",
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to delete.";
      ShowNotifications.showAlertNotification(errorMessage, "error");
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getStarHubUpdateResponses(id) {
    try {
      const response = await apiClient.get(`/star-update/responses/full-details/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getStarHubUpdateFullDetails(id) {
    try {
      const response = await apiClient.get(
        `/star-update/${id}`,
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
}

export default new StarUpdateApi();
