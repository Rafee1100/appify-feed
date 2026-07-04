import http from "./httpServices";
import { mapToUserModel } from "./normalizers";
import { clearTokens, setTokens } from "@/lib/tokenStorage";

const API_ENDPOINT = "/auth";

export const registerUser = async (payload) => {
  const body = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    password: payload.password,
  };
  const data = await http.post(`${API_ENDPOINT}/register`, body);
  if (data.accessToken && data.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }
  return { message: data.message, user: mapToUserModel(data.user) };
};

export const login = async (payload) => {
  const data = await http.post(`${API_ENDPOINT}/login`, payload);
  if (data.accessToken && data.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }
  return { message: data.message, user: mapToUserModel(data.user) };
};

export const logout = async () => {
  try {
    const refreshToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("refreshToken")
        : null;
    await http.post(`${API_ENDPOINT}/logout`, { refreshToken });
  } finally {
    clearTokens();
  }
};

export const getMe = async () => {
  const data = await http.get(`${API_ENDPOINT}/me`);
  return { user: mapToUserModel(data.user) };
};