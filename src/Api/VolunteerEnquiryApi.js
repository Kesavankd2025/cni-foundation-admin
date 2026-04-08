import { apiClient } from "../Config/Index";

const VolunteerEnquiryApi = {
    getVolunteerEnquiryList: async (page = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/volunteer-enquiry?page=${page}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getVolunteerEnquiryById: async (id) => {
        try {
            const response = await apiClient.get(`/volunteer-enquiry/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default VolunteerEnquiryApi;
