import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class RoleApi {
  async getModules() {
    try {
      const response = await apiClient.get("modules/list");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Modules. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createRole(data) {
    try {
      const response = await apiClient.post("/role", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Role Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Role. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getRoles(params = {}) {
    try {
      const config = {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          roleType: params.roleType || "",
        },
      };

      const response = await apiClient.get("role/list", config);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Roles. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getRole(id) {
    try {
      // http://localhost:5000/api/admin/role/69770134d6117af5eff0ae75 -details
      const response = await apiClient.get(`role/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Role Details. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateRole(id, data) {
    try {
      // http://localhost:5000/api/admin/role/6976f5160eb77d121283bb3d -edit
      // Assuming PUT or POST. Using PUT as is common, unless user specifically said POST.
      // Based on typical REST and existing ChapterApi, I will use PUT.
      // If it fails, I'll switch to POST.
      const response = await apiClient.put(`role/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Role Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      // Fallback to POST if PUT fails with 404 or 405 (Method Not Allowed)?
      // No, explicit error handling is better. But I'll stick to PUT for now.
      // Actually, the user's example "http://localhost:5000/api/admin/role/6976f5160eb77d121283bb3d"
      // without /update suffix suggests standard REST. ChapterApi uses PUT.
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Role. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteRole(id) {
    try {
      // http://localhost:5000/api/admin/role/69770134d6117af5eff0ae75 -delete
      const response = await apiClient.patch(`role/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Role Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Role. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new RoleApi();
