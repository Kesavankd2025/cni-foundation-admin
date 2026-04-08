import { apiClient } from "../Config/Index";

const ContactEnquiryApi = {
    getContactEnquiryList: async (page = 0, limit = 10, search = "") => {
        try {
            const response = await apiClient.get(`/contact-enquiry?page=${page}&limit=${limit}&search=${search}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },

    getContactEnquiryById: async (id) => {
        try {
            const response = await apiClient.get(`/contact-enquiry/${id}`);
            return { status: true, response: response.data };
        } catch (error) {
            return { status: false, response: error.response?.data };
        }
    },
};

export default ContactEnquiryApi;
