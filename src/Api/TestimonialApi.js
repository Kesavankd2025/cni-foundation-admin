import apiClient from "../Config/Index";

const TestimonialApi = {
    createTestimonial: async (data) => {
        try {
            const response = await apiClient.post("/testimonial", data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getTestimonialList: async (currentPage = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/testimonial?page=${currentPage}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getTestimonialById: async (id) => {
        try {
            const response = await apiClient.get(`/testimonial/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    updateTestimonial: async (id, data) => {
        try {
            const response = await apiClient.put(`/testimonial/${id}`, data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    deleteTestimonial: async (id) => {
        try {
            const response = await apiClient.delete(`/testimonial/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default TestimonialApi;
