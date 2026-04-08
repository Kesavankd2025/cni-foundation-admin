import { apiClient } from "../Config/Index";

const BlogApi = {
    createBlog: async (data) => {
        try {
            const response = await apiClient.post("/blog", data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getBlogList: async (currentPage = 0, limit = 10, search = "", categoryId = "") => {
        try {
            const response = await apiClient.get(`/blog?page=${currentPage}&limit=${limit}&search=${search}&categoryId=${categoryId}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getBlogById: async (id) => {
        try {
            const response = await apiClient.get(`/blog/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    updateBlog: async (id, data) => {
        try {
            const response = await apiClient.put(`/blog/${id}`, data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    deleteBlog: async (id) => {
        try {
            const response = await apiClient.delete(`/blog/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default BlogApi;
