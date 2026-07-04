import http from "./httpServices";
import { mapToUserModel } from "./normalizers";

const API_ENDPOINT = "/auth";

export const registerUser = async (payload) => {
  // Backend expects: { first_name, last_name, email, password }
  const body = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    password: payload.password,
  };
  const data = await http.post(`${API_ENDPOINT}/register`, body);
  return { message: data.message, user: mapToUserModel(data.user) };
};

export const login = async (payload) => {
  const data = await http.post(`${API_ENDPOINT}/login`, payload);
  return { message: data.message, user: mapToUserModel(data.user) };
};

export const logout = () => http.post(`${API_ENDPOINT}/logout`);

export const getMe = async () => {
  const data = await http.get(`${API_ENDPOINT}/me`);
  return { user: mapToUserModel(data.user) };
};