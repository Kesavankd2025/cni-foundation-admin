import apiClient from "../Config/Index";

const LeadershipTeamApi = {
    createMember: async (data) => {
        try {
            const response = await apiClient.post("/leadership-team", data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getMemberList: async (currentPage = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/leadership-team?page=${currentPage}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getMemberById: async (id) => {
        try {
            const response = await apiClient.get(`/leadership-team/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    updateMember: async (id, data) => {
        try {
            const response = await apiClient.put(`/leadership-team/${id}`, data);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    deleteMember: async (id) => {
        try {
            const response = await apiClient.delete(`/leadership-team/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default LeadershipTeamApi;
