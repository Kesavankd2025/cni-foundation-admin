import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class ProductApi {
    async createProduct(data) {
        try {
            const response = await apiClient.post(`/products/create`, data);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Product created successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create product.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async getProducts(page, limit, search) {
        if (typeof page === "object" && page !== null) {
            ({ page, limit, search } = page);
        }
        try {
            const url = `/products/list?page=${page || 0}&limit=${limit || 0}&search=${search || ""}`;
            const response = await apiClient.get(url);
            if (response.status === 200) {
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch products.";
            console.error(errorMessage);
            return { status: false, error: errorMessage };
        }
    }

    async getProductDetails(id) {
        if (typeof id === "object" && id !== null) {
            ({ id } = id);
        }
        try {
            const response = await apiClient.get(`/products/details/${id}`);
            if (response.status === 200) {
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch product details.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async updateProduct(id, data) {
        try {
            const response = await apiClient.put(`/products/edit/${id}`, data);
            if (response.status === 200) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Product updated successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update product.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async deleteProduct(id) {
        try {
            const response = await apiClient.delete(`/products/delete/${id}`);
            if (response.status === 200) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Product deleted successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete product.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }
    async statusUpdate(id) {
        try {
            const response = await apiClient.patch(`/products/${id}/toggle-active`);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Product Status Updated Successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete product.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }
}

export default new ProductApi();
