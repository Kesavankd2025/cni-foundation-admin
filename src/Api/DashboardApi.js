import apiClient from "../Config/Index";

class DashboardApi {
  async getDashboardStats() {
    try {
      const response = await apiClient.get("/dashboard-apis/stats");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getDashboardActivities() {
    try {
      const response = await apiClient.get("/dashboard-apis/activities");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getOverallRevenue() {
    try {
      const response = await apiClient.get(
        "/dashboard-apis/overall-revenue/list",
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getRecentlyJoinedMembers() {
    try {
      const response = await apiClient.get("/dashboard-apis/recently-joined");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getTop121Members() {
    try {
      const response = await apiClient.get("/dashboard-apis/top/1to1-members");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getTopThankYouMembers() {
    try {
      const response = await apiClient.get(
        "/dashboard-apis/top/thankyou-members",
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getTopReferralMembers() {
    try {
      const response = await apiClient.get(
        "/dashboard-apis/top/referral-members",
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getStarAchievements() {
    try {
      const response = await apiClient.get("/dashboard-apis/star-achievements");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
}

export default new DashboardApi();
