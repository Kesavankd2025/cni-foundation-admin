import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class LoginApi {
  async login(credentials) {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Login Successful!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Login Failed. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async getRolesAndPermissions() {
    try {
      const response = await apiClient.get("/auth/profile");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async requestOtp(phoneNumber) {
    try {
      const response = await apiClient.post("/auth/pin/forgot/request-otp", { phoneNumber });
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "OTP sent successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async verifyOtp(payload) {
    try {
      const response = await apiClient.post("/auth/pin/forgot/verify-otp", payload);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "OTP Verified!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async resetPin(payload) {
    try {
      const response = await apiClient.post("/auth/pin/forgot/reset", payload);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "PIN Reset Successful!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "PIN Reset Failed. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new LoginApi();
