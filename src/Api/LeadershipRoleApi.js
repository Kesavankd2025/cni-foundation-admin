import apiClient from "../Config/Index";

class LeadershipRoleApi {
    async getAllRoles() {
        try {
            const response = await apiClient.get("/leadership-role");
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }

    async createRole(data) {
        try {
            const response = await apiClient.post("/leadership-role", data);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }

    async updateRole(id, data) {
        try {
            const response = await apiClient.put(`/leadership-role/${id}`, data);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }

    async deleteRole(id) {
        try {
            const response = await apiClient.delete(`/leadership-role/${id}`);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            return { status: false, response: error?.response?.data || error };
        }
    }
}

export default new LeadershipRoleApi();
