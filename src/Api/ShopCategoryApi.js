import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class ShopCategoryApi {
    async createShopCategory(data) {
        try {
            const response = await apiClient.post(`/product-category`, data);
            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Category created successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create category.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async getShopCategories() {
        try {
            const response = await apiClient.get(`/product-category`);
            if (response.status === 200) {
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch categories.";
            // Only show error if needed, listing sometimes silences error if empty
            console.error(errorMessage);
            return { status: false, error: errorMessage };
        }
    }

    async getShopCategoryDetails(id) {
        try {
            const response = await apiClient.get(`/product-category/${id}`);
            if (response.status === 200) {
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch category details.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async updateShopCategory(id, data) {
        try {
            const response = await apiClient.put(`/product-category/${id}`, data);
            if (response.status === 200) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Category updated successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update category.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }

    async deleteShopCategory(id) {
        try {
            const response = await apiClient.delete(`/product-category/${id}`);
            if (response.status === 200) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Category deleted successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete category.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }
    async statusUpdate(id) {
        try {
            const response = await apiClient.patch(`/product-category/${id}/toggle-active`);
            if (response.status === 200) {
                ShowNotifications.showAlertNotification(
                    response.data.message || "Category Status Updated Successfully!",
                    true
                );
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete category.";
            ShowNotifications.showAlertNotification(errorMessage, false);
            return { status: false, error: errorMessage };
        }
    }
}

export default new ShopCategoryApi();
