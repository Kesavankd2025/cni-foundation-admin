import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class MemberApi {
  async createMember(data) {
    try {
      const response = await apiClient.post("/member/create", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Member Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Member. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMembers(currentPage, limit, search, memberType, chapter, zoneId, chapterId, edId, rdId) {
    if (typeof currentPage === "object" && currentPage !== null) {
      const params = currentPage;
      currentPage = params.currentPage !== undefined ? params.currentPage : params.page;
      limit = params.limit;
      search = params.search;
      memberType = params.memberType;
      chapter = params.chapter;
      zoneId = params.zoneId;
      chapterId = params.chapterId;
      edId = params.edId;
      rdId = params.rdId;
    }
    try {
      let url = `/member/list?page=${currentPage || 0}&limit=${limit || 0}&search=${search || ""}`;

      if (memberType) url += `&memberType=${memberType}`;
      if (chapter) url += `&chapter=${chapter}`;
      if (zoneId) url += `&zoneId=${zoneId}`;
      if (chapterId) url += `&chapterId=${chapterId}`;
      if (edId) url += `&edId=${edId}`;
      if (rdId) url += `&rdId=${rdId}`;

      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Members. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMemberDetails(id) {
    try {
      const response = await apiClient.get(`/member/details/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Member Details. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateMember(id, data) {
    try {
      const response = await apiClient.patch(`/member/update/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Member Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Member. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteMember(id) {
    try {
      const response = await apiClient.delete(`/member/delete/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Member Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Member. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.patch(`/member/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Member Status Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Member. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async generateMembershipId() {
    try {
      const response = await apiClient.post("/member/generate/id");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Generate Membership ID. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMembersByChapter(params = {}) {
    try {
      const config = {
        params: {
          chapterId: params.chapterId,
          page: params.page,
          limit: params.limit,
          search: params.search,
        },
      };

      const response = await apiClient.get("/member/list", config);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Members. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMembersByChapterRole(params = {}) {
    try {
      const config = {
        params: {
          ...params,
        },
      };

      const response = await apiClient.get("/member/by-chapter-role", config);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to Get Members By Role. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMemberProfileDetails(id) {
    try {
      const response = await apiClient.get(`/profile/myprofile/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Member Profile Details. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMemberGiveAndAskList(params = {}) {
    try {
      const config = {
        params: {
          ...params,
        },
      };

      const response = await apiClient.get("/profile/list/bymember", config);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to Get Members Give List. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getProfileTrainingHistory(id) {
    try {
      const response = await apiClient.get(`/profile/training-history/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Training History. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getProfileTestimonials(id) {
    try {
      const response = await apiClient.get(`/profile/testimonials/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Training History. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMemberLocations(currentPage, rowsPerPage, search) {
    if (typeof currentPage === "object" && currentPage !== null) {
      ({ currentPage, rowsPerPage, search } = currentPage);
    }
    try {
      const url = `/member-location/list?page=${currentPage || 0}&limit=${rowsPerPage || 10}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async statusUpdateLocation(id) {
    try {
      const response = await apiClient.patch(
        `/member-location/${id}/toggle-active`,
      );
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Location Status Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to Update Location Status.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async getReferredByMembers() {
    try {
      const response = await apiClient.get("/member/referredby-list");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.error("Error fetching referred by members list", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMemberEnquiries(currentPage = 0, limit = 10, search = "") {
    try {
      const response = await apiClient.get(`/member-enquiry?page=${currentPage}&limit=${limit}&search=${search}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.error("Error fetching member enquiries", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async exportMemberEnquiries(params) {
    try {
      const { fromDate, toDate, format } = params;

      const url = `/member-enquiry/export?fromDate=${fromDate}&toDate=${toDate}&format=${format || "csv"}`;

      const response = await apiClient.get(url, {
        responseType: "blob", // 🔥 REQUIRED
      });

      if (response.status === 200 || response.status === 201) {
        return { status: true, data: response.data };
      }
    } catch (error) {
      return {
        status: false,
        error: error?.response || error,
      };
    }
  }
}


export default new MemberApi();
