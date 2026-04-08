import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class ChapterApi {
  async createChapter(data) {
    try {
      const response = await apiClient.post("chapters", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chapter Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Chapter. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getChapter(input) {
    let id, page, limit, search, regionId, regionIds, zoneId;
    if (typeof input === "object" && input !== null) {
      ({ id, page, limit, search, regionId, regionIds, zoneId } = input);
    } else {
      id = input;
    }
    try {
      let url = id ? `chapters/${id}` : `chapters?page=${page || 0}&limit=${limit || 0}&search=${search || ""}`;

      if (!id) {
        if (zoneId) url += `&zoneId=${zoneId}`;

        let regions = [];

        // Extract array from regionId
        if (Array.isArray(regionId)) regions = regionId;
        else if (typeof regionId === "string" && regionId.includes(",")) regions = regionId.split(",");
        else if (regionId) url += `&regionId=${regionId}`;

        // Extract array from regionIds
        if (Array.isArray(regionIds)) regions = [...regions, ...regionIds];
        else if (typeof regionIds === "string" && regionIds.includes(",")) regions = [...regions, ...regionIds.split(",")];
        else if (regionIds) regions.push(regionIds);

        // Clean values
        regions = regions.map(r => r.trim()).filter(r => r !== "");

        if (regions.length > 0) {
          const params = new URLSearchParams();
          regions.forEach(r => params.append("regionIds", r));
          url += `&${params.toString()}`;
        }
      }

      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Chapter. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateChapter(data) {
    try {
      const response = await apiClient.put(`chapters/${data.id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chapter Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Chapter. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteChapter(id) {
    try {
      const response = await apiClient.delete(`chapters/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chapter Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Chapter. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.patch(`chapters/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chapter Status Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Chapter. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  // Chapter Role APIs
  async getChapterRoles(chapterId) {
    try {
      const response = await apiClient.get(`/chapter-roles/list/${chapterId}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }

  async getChapterRolesHistory(chapterId, params) {
    try {
      const response = await apiClient.get(`/chapter-roles/history/${chapterId}`, { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }

  async assignChapterRole(data) {
    try {
      const response = await apiClient.post("/chapter-roles", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Role Assigned Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to assign role";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, response: error };
    }
  }

  async updateChapterRole(id, data) {
    try {
      const response = await apiClient.patch(`/chapter-roles/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          "Role updated successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update role";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, response: error };
    }
  }

  async deleteChapterRole(id) {
    try {
      const response = await apiClient.delete(`/chapter-roles/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          "Role deleted successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      ShowNotifications.showAlertNotification("Failed to delete role", false);
      return { status: false, response: error };
    }
  }
  async getChapterEdRdMembers(chapterId) {
    try {
      const response = await apiClient.get(
        `/chapters/chapterbased/ed-rd-members?chapterId=${chapterId}`,
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }
  async roleStatusUpdate(id) {
    try {
      const response = await apiClient.patch(`/chapter-roles/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Chapter Role updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update Chapter Role. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getChapterRevenue(params) {
    try {
      const response = await apiClient.get("/chapters/chapter-revenue/list", {
        params,
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }

  async getChapterStats(chapterId) {
    try {
      const response = await apiClient.get("/chapters/chapter-stats/details", {
        params: { chapterId },
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }

  async getTop1to1Members(chapterId) {
    try {
      const response = await apiClient.get("/chapters/top/1to1-members", {
        params: { chapterId },
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }

  async getTopThankYouMembers(chapterId) {
    try {
      const response = await apiClient.get("/chapters/top/thankyou-members", {
        params: { chapterId },
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }

  async getTopReferralMembers(chapterId) {
    try {
      const response = await apiClient.get("/chapters/top/referral-members", {
        params: { chapterId },
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error };
    }
  }
}

export default new ChapterApi();
