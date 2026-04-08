import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class VerticalDirectorApi {
    async getRoles() {
        try {
            const response = await apiClient.get("vertical-directors/roles");
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error };
        }
    }

    async getDirectorsList(params) {
        try {
            const response = await apiClient.get("vertical-directors/list", { params });
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error };
        }
    }

    async assignDirector(data) {
        try {
            const response = await apiClient.post("vertical-directors", data);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Director Assigned Successfully!",
                    true,
                );
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to Assign Director. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, response: error?.response?.data || error };
        }
    }

    async updateDirector(id, data) {
        try {
            const response = await apiClient.patch(`vertical-directors/${id}`, data);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Director Updated Successfully!",
                    true,
                );
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to Update Director. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, response: error?.response?.data || error };
        }
    }

    async getHistory(params) {
        try {
            const response = await apiClient.get("vertical-directors/history", { params });
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error };
        }
    }

    async toggleStatus(id) {
        try {
            const response = await apiClient.patch(`vertical-directors/${id}/toggle-active`);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Status Updated Successfully!",
                    true,
                );
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to Update Status. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, response: error };
        }
    }

    async deleteDirector(id) {
        try {
            const response = await apiClient.delete(`vertical-directors/${id}`);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Director Deleted Successfully!",
                    true,
                );
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to Delete Director. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, response: error };
        }
    }
}

export default new VerticalDirectorApi();
