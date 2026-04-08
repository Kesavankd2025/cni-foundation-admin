import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class LogReportApi {
    async getLoginReports(params = {}) {
        try {
            const config = {
                params: {
                    loginfrom: params.loginfrom, // WEB or MOBILE
                    page: params.page,
                    limit: params.limit,
                    search: params.search,
                },
            };

            const response = await apiClient.get("auth/login-report", config);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch log reports. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return {
                status: false,
                response: error?.response?.data || error,
            };
        }
    }
}

export default new LogReportApi();
