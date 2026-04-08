import { apiClient } from "../Config/Index";

const MemberEnquiryApi = {
    getMemberEnquiryList: async (currentPage = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/membership-application?page=${currentPage}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getMemberEnquiryById: async (id) => {
        try {
            const response = await apiClient.get(`/membership-application/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default MemberEnquiryApi;
