import {
  register,
  login,
  refresh,
  logout,
  setAuthCookies,
  clearAuthCookies,
} from "./auth.service.js";
import asyncHandler from "../../lib/asyncHandler.js";

export const registerHandler = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await register(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ user, accessToken, refreshToken });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await login(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user, accessToken, refreshToken });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await refresh(raw);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user, accessToken, refreshToken });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken || req.body?.refreshToken;
  await logout(raw);
  clearAuthCookies(res);
  res.status(204).end();
});

export const meHandler = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});
