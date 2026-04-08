import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class OrderApi {
    async createOrder(data) {
        try {
            const response = await apiClient.post("/orders/create", data);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Order created successfully!",
                    true,
                );
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create order. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return {
                status: false,
                response: error?.response?.data || error,
            };
        }
    }

    async getOrderList(id, currentPage, rowsPerPage, search) {
        try {
            const url = id
                ? `/orders/details/${id}`
                : `/orders/list?page=${currentPage}&limit=${rowsPerPage}&search=${search || ""}`;
            const response = await apiClient.get(url);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to get orders. Please try again.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return {
                status: false,
                response: error?.response?.data || error,
            };
        }
    }

    async updateOrderStatus(id, status, paymentStatus = "Pending") {
        try {
            const response = await apiClient.put(`/orders/status/${id}`, {
                status: status,
                paymentStatus: paymentStatus
            });
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Order status updated successfully!",
                    true
                );
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update order status.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, response: error?.response?.data || error };
        }
    }

    async getOrderDetails(id) {
        try {
            const response = await apiClient.get(`/orders/details/${id}`);
            if (response.status === 200 || response.status === 201) {
                return { status: true, response: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch order details.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, response: error?.response?.data || error };
        }
    }
}

export default new OrderApi();
