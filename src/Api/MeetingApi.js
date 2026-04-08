import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class MeetingApi {
  async createMeeting(data) {
    try {
      const response = await apiClient.post("/meetings/create", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Meeting Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Meeting. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getMeeting(id, page, limit, search) {
    if (typeof id === "object" && id !== null) {
      ({ id, page, limit, search } = id);
    }
    try {
      const url = id
        ? `/meetings/details/${id}`
        : `/meetings/list?page=${page || 0}&limit=${limit || 0}&search=${search || ""}`;

      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Meeting Data. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getAttendanceList(params = {}) {
    try {
      const config = {
        params: {
          page: params.page,
          limit: params.limit,
          zoneId: params.zoneId,
          regionId: params.regionId,
          chapterId: params.chapterId,
          memberId: params.memberId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          month: params.month,
          year: params.year,
          type: params.type,
          dateRangeFilter: params.dateRangeFilter,
          search: params.search,
        },
      };

      const response = await apiClient.get("/meetings/attendance-list", config);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Attendance List. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateMeeting(id, data) {
    try {
      const response = await apiClient.put(`/meetings/edit/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Meeting Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Meeting. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteMeeting(id) {
    try {
      const response = await apiClient.delete(`/meetings/delete/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Meeting Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Meeting. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async statusUpdate(id) {
    try {
      const response = await apiClient.patch(`/meetings/${id}/toggle-active`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Meeting Status Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Meeting. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async getAttendanceListBySource(params = {}) {
    try {
      const config = {
        params: {
          page: params.page,
          limit: params.limit,
          sourceId: params.sourceId,
          sourceType: params.sourceType,
          search: params.search,
        },
      };

      const response = await apiClient.get(
        "/meetings/attendance-list-by-source",
        config,
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Attendance Details. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getAttendanceHistoryByMember(memberId) {
    try {
      const response = await apiClient.get(
        `/meetings/attendance-history-by-member?memberId=${memberId}`,
      );
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Member History. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new MeetingApi();
