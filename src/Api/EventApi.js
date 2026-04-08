import { apiClient } from "../Config/Index";

const EventApi = {
    createEvent: async (data) => {
        try {
            const response = await apiClient.post("/event", data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getEventList: async (currentPage = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/event?page=${currentPage}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getEventById: async (id) => {
        try {
            const response = await apiClient.get(`/event/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    updateEvent: async (id, data) => {
        try {
            const response = await apiClient.put(`/event/${id}`, data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    deleteEvent: async (id) => {
        try {
            const response = await apiClient.delete(`/event/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default EventApi;
