import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class PointsApi {
    async getPoints() {
        try {
            const response = await apiClient.get(`/points`);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to Fetch Points.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async updatePoint(id, data) {
        try {
            const response = await apiClient.patch(`/points/${id}`, data);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Point Updated Successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to Update Point.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

}

export default new PointsApi();
