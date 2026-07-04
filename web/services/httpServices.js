import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/tokenStorage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ||
  "http://localhost:4000";

const attachBearer = (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const HTTP_DEFAULTS = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
  timeout: 15000,
});

const REFRESH_CLIENT = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
  timeout: 15000,
});

HTTP_DEFAULTS.interceptors.request.use(attachBearer);

const unwrap = async (promise) => {
  const { data } = await promise;
  return data;
};

HTTP_DEFAULTS.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const originalConfig = error.config;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const requestUrl = originalConfig?.url ?? "";
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/refresh");

    if (
      status === 401 &&
      originalConfig &&
      !isAuthRoute &&
      !originalConfig._retry
    ) {
      originalConfig._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const { data } = await REFRESH_CLIENT.post("/auth/refresh", {
          refreshToken,
        });
        if (data?.accessToken) setTokens(data);
        return HTTP_DEFAULTS(originalConfig);
      } catch (refreshErr) {
        clearTokens();
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

const http = {
  instance: HTTP_DEFAULTS,
  get: (url, config) => unwrap(HTTP_DEFAULTS.get(url, config)),
  post: (url, data, config) => unwrap(HTTP_DEFAULTS.post(url, data, config)),
  patch: (url, data, config) => unwrap(HTTP_DEFAULTS.patch(url, data, config)),
  put: (url, data, config) => unwrap(HTTP_DEFAULTS.put(url, data, config)),
  delete: (url, config) => unwrap(HTTP_DEFAULTS.delete(url, config)),
};

export default http;