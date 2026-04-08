import apiClient from "../Config/Index";
import ShowNotifications from "../helper/ShowNotifications";

class ReportApi {
  async getOneToOneReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId } = params;
      // Removed leading slash to ensure correct base URL concatenation
      const url = `reports/one-to-one-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelOneToOneReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/one-to-one-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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

  async getReferralReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId } = params;
      // Removed leading slash
      const url = `reports/referral-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelReferralReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/referral-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getVisitorReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, fromDate, toDate } = params;
      const url = `reports/visitor-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&fromDate=${fromDate || ""}&toDate=${toDate || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelVisitorReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/visitor-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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

  async getChiefGuestReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId } = params;
      const url = `reports/chief-guests-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelChiefGuestReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/chief-guests-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getPowerMeetReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId } = params;
      const url = `reports/power-dates-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelPowerMeetReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/power-dates-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getTrainingsReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, regionId } =
        params;
      const url = `reports/trainings-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelTrainingsReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/trainings-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getMemberPointsReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, regionId } =
        params;
      const url = `reports/member-points-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelMemberPointsReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId, regionId } = params;

      const url = `reports/member-points-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;

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

  async getThankYouSlipReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, regionId } =
        params;
      const url = `reports/thank-you-slips-reports?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelThankYouSlipReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/thank-you-slips-reports/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getChapterReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, regionId } =
        params;
      const url = `reports/chapter-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelChapterReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/chapter-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getAbsentProxyReport(params) {
    try {
      const {
        page,
        limit,
        search,
        chapterId,
        zoneId,
        edId,
        rdId,
        regionId,
        period,
      } = params;
      const url = `meetings/absent-proxy-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}&period=${period || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelAbsentProxyReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/absent-proxy-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getMemberAttendanceHistory(memberId, params) {
    try {
      const { page, limit, search } = params;
      const url = `meetings/absent-proxy-history/${memberId}?page=${page}&limit=${limit}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelMemberAttendanceHistory(memberId, params) {
    try {
      const { fromDate, toDate, format } = params;

      const url = `reports/member-attendance-history/${memberId}?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}`;

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
  async getPerformanceReport(params) {
    try {
      const {
        page,
        limit,
        search,
        chapterId,
        zoneId,
        edId,
        rdId,
        regionId,
        period,
        formType,
      } = params;
      const url = `reports/performance-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}&period=${period || ""}&formType=${formType || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelPerformanceReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/performance-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getRenewalReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, regionId } =
        params;
      const url = `reports/renewal-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelRenewalReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/renewal-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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

  async getRenewalHistory(params) {
    try {
      const { page, limit, search, memberId, fromDate, toDate } = params;
      let url = `reports/renewal-history?page=${page}&limit=${limit}&search=${search || ""}&fromDate=${fromDate || ""}&toDate=${toDate || ""}`;
      if (memberId) url += `&memberId=${memberId}`;

      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async excelRenewalHistory(params) {
    try {
      const { fromDate, toDate, format, search, memberId } = params;
      const url = `reports/renewal-history/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&memberId=${memberId || ""}`;

      const response = await apiClient.get(url, {
        responseType: "blob",
      });

      if (response.status === 200 || response.status === 201) {
        return { status: true, data: response.data };
      }
    } catch (error) {
      return { status: false, error: error?.response || error };
    }
  }

  async updateRenewalHistory(historyId, data) {
    try {
      const response = await apiClient.put(`member/renewal-history/${historyId}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Renewal history updated successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update renewal history.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }

  async renewMembership(id, data) {
    try {
      const url = `member/${id}/renew`;
      const response = await apiClient.put(url, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Membership renewed successfully!",
          true,
        );
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to renew membership. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return { status: false, error: errorMessage };
    }
  }

  async toggleRenewalStatus(id) {
    try {
      const response = await apiClient.patch(`member/${id}/toggle-renewal`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Status Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update status.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getChapterMemberReport(params) {
    try {
      const { page, limit, search, chapterId } = params;
      const url = `reports/chapter-member-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelChapterMemberReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/chapter-member-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async excelMemberReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/member/list/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getTestimonialsReport(params) {
    try {
      const { page, limit, search, chapterId, zoneId, edId, rdId, regionId } =
        params;
      const url = `reports/testimonials-report?page=${page}&limit=${limit}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}&regionId=${regionId || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelTestimonialsReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/testimonials-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getChiefGuestHistory(params) {
    try {
      const {
        page,
        limit,
        search,
        chiefGuestId,
      } = params;
      const url = `reports/chief-guest-history/${chiefGuestId}?page=${page}&limit=${limit}&search=${search || ""}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }
  async excelMemberSuggestionReport(params) {
    try {
      const { fromDate, toDate, format, search, chapterId, zoneId, edId, rdId } = params;

      const url = `reports/member-suggestion-report/export?fromDate=${fromDate || ""}&toDate=${toDate || ""}&format=${format || "csv"}&search=${search || ""}&chapterId=${chapterId || ""}&zoneId=${zoneId || ""}&edId=${edId || ""}&rdId=${rdId || ""}`;

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
  async getTrainingAttendanceReport(trainingId, params) {
    try {
      let url = `reports/training/${trainingId}/attendance-report`;
      let config = {};

      if (params) {
        const { page, limit, search, statusFilter } = params;
        url += `?page=${page || 0}&limit=${limit || 0}&search=${search || ""}&statusFilter=${statusFilter || ""}`;
      } else {
        config.responseType = "blob";
      }

      const response = await apiClient.get(url, config);
      if (response.status === 200 || response.status === 201) {
        if (params) {
          return { status: true, response: response.data };
        }
        return { status: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch attendance report. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        error: errorMessage,
      };
    }
  }
}

export default new ReportApi();
