import axios from "axios";

const HTTP_DEFAULTS = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  timeout: 15000,
});

const REFRESH_CLIENT = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  timeout: 15000,
});

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
        await REFRESH_CLIENT.post("/auth/refresh");
        return HTTP_DEFAULTS(originalConfig);
      } catch (refreshErr) {
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