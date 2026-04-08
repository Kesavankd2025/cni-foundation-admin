import apiClient from "../Config/Index";

class MediaCategoryApi {
    async getAllCategories() {
        try {
            const response = await apiClient.get("/media-category");
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }

    async createCategory(data) {
        try {
            const response = await apiClient.post("/media-category", data);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }

    async updateCategory(id, data) {
        try {
            const response = await apiClient.put(`/media-category/${id}`, data);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }

    async deleteCategory(id) {
        try {
            const response = await apiClient.delete(`/media-category/${id}`);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }
}

export default new MediaCategoryApi();
