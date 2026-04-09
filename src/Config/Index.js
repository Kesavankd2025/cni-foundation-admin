import axios from "axios";

const APP_ENV = process.env.REACT_APP_ENV || "local";

let IMAGE_BASE_URL = "";
let BASE_URL = "";
let server = "";

switch (APP_ENV) {
  case "dev":
    IMAGE_BASE_URL = "http://192.168.1.24:5000/public";
    BASE_URL = "http://192.168.1.36:4000/api/admin";
    server = "http://192.168.1.36:4000";
    break;

  case "production":
    IMAGE_BASE_URL = "https://api.cnibusinessforum.in/public";
    BASE_URL = "https://api.cnibusinessforum.in/api/admin";
    server = "https://api.cnibusinessforum.in";
    break;

  case "local":
  default:
    IMAGE_BASE_URL = "http://localhost:5000/public";
    BASE_URL = "http://localhost:5000/api/admin";
    server = "http://localhost:5000";
    break;
}

export { IMAGE_BASE_URL, BASE_URL, server };

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("userToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Disabled 401 redirect as requested
    /*
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login") &&
      !window.location.pathname.includes("/sign-in")
    ) {
      localStorage.removeItem("userToken");
      window.location.href = "/sign-in";
    }
    */
    return Promise.reject(error);
  }
);

export default apiClient;
