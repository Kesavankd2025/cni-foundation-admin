import { apiClient } from "../Config/Index";

const InternshipEnquiryApi = {
    getInternshipEnquiryList: async (page = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/internship-enquiry?page=${page}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getInternshipEnquiryById: async (id) => {
        try {
            const response = await apiClient.get(`/internship-enquiry/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default InternshipEnquiryApi;
