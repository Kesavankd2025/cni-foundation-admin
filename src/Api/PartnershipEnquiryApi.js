import { apiClient } from "../Config/Index";

const PartnershipEnquiryApi = {
    getPartnershipEnquiryList: async (page = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/partnership-enquiry?page=${page}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getPartnershipEnquiryById: async (id) => {
        try {
            const response = await apiClient.get(`/partnership-enquiry/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default PartnershipEnquiryApi;
