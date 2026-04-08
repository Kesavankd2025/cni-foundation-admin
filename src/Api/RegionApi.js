import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class RegionApi {
  async getAdminUser(zoneId = "") {
    try {
      const url = zoneId ? `adminUser?zoneId=${zoneId}` : "adminUser";
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Admin User. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async getRoleBasedUser(code = "", zoneId = "", chapterId = "") {
    try {
      let url = `member/role/code/${code.toLowerCase()}`;
      const params = [];
      if (zoneId) params.push(`zoneId=${zoneId}`);
      if (chapterId) params.push(`chapterId=${chapterId}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Role. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }


  async getRegionList(zoneId = null, zoneIdsParam = null) {
    try {
      let url = "region";
      let zones = [];

      // Ensure we extract an array of IDs from either zoneId or zoneIdsParam
      if (Array.isArray(zoneId)) zones = zoneId;
      else if (typeof zoneId === "string" && zoneId.includes(",")) zones = zoneId.split(",");
      else if (zoneId) zones = [zoneId];

      if (Array.isArray(zoneIdsParam)) zones = [...zones, ...zoneIdsParam];
      else if (typeof zoneIdsParam === "string" && zoneIdsParam.includes(",")) zones = [...zones, ...zoneIdsParam.split(",")];
      else if (zoneIdsParam) zones.push(zoneIdsParam);

      // Clean up whitespace
      zones = zones.map(id => id.trim()).filter(id => id !== "");

      if (zones.length > 0) {
        // Construct standard array structure: "zoneIds=id1&zoneIds=id2"
        const queryParams = new URLSearchParams();
        zones.forEach(id => queryParams.append("zoneIds", id));
        url += `?${queryParams.toString()}`;
      }

      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getRegionByZone(zoneId) {
    try {
      const response = await apiClient.get("region", {
        params: { zoneId },
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Regions. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createRegion(data) {
    try {
      const response = await apiClient.post("/region", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Region Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getRegion(page, limit, search) {
    try {
      const url = `/region?page=${page || 0}&limit=${limit}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async getRegionDetails(id) {
    if (typeof id === "object" && id !== null) {
      ({ id } = id);
    }
    try {
      const url = `/region/${id}`
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async updateRegion(data) {
    try {
      const response = await apiClient.put(`/region/${data.id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Region Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteRegion(id) {
    try {
      const response = await apiClient.delete(`/region/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Region Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.put(`/region/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Region Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Region. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new RegionApi();
