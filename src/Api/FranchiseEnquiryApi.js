import { apiClient } from "../Config/Index";

const FranchiseEnquiryApi = {
    getFranchiseEnquiryList: async (currentPage = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/franchise-enquiry?page=${currentPage}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getFranchiseEnquiryById: async (id) => {
        try {
            const response = await apiClient.get(`/franchise-enquiry/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default FranchiseEnquiryApi;
