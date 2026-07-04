"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import * as authService from "@/services/authServices";

export const AUTH_KEY = ["me"];

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  const query = useQuery({
    queryKey: AUTH_KEY,
    queryFn: authService.getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data?.user) {
      setUser(query.data.user);
    } else if (query.isError) {
      setLoading(false);
    }
  }, [query.data, query.isError, setLoading, setUser]);

  return { user, isLoading };
};

export const useLogin = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => authService.login(payload),
    onSuccess: (data) => {
      toast.success("Logged in successfully.");
      setUser(data.user);
      queryClient.setQueryData(AUTH_KEY, { user: data.user });
      router.push("/feed");
    },
    onError: () => {
      toast.error("Login failed. Please check your credentials.");
    },
  });
};

export const useRegister = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => authService.registerUser(payload),
    onSuccess: (data) => {
      toast.success("Account created successfully.");
      setUser(data.user);
      queryClient.setQueryData(AUTH_KEY, { user: data.user });
      router.push("/feed");
    },
    onError: () => {
      toast.error("Registration failed. Please try again.");
    },
  });
};

export const useLogout = () => {
  const { clearUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      toast.success("Logged out.");
      clearUser();
      queryClient.clear();
      router.push("/auth/login");
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });
};