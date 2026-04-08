import apiClient from "../Config/Index";

class BannerApi {
  async getBanners(params = {}) {
    try {
      const response = await apiClient.get("/banner", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getBannerById(id) {
    try {
      const response = await apiClient.get(`/banner/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async createBanner(data) {
    try {
      const response = await apiClient.post("/banner", data);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async updateBanner(data) {
    try {
      const response = await apiClient.put(`/banner/${data.id}`, data);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async deleteBanner(id) {
    try {
      const response = await apiClient.delete(`/banner/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async updateBannerOrder(data) {
    try {
      const response = await apiClient.put("/banner/update-order", data);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
}

export default new BannerApi();
