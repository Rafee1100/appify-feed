"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken } from "@/lib/tokenStorage";
import { useAuthStore } from "@/store/authStore";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    setAuthed(Boolean(access || refresh) || Boolean(user));
    setChecked(true);
  }, [user]);

  useEffect(() => {
    if (checked && !authed) {
      router.replace("/auth/login");
    }
  }, [checked, authed, router]);

  if (!checked || !authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Redirecting…
      </div>
    );
  }

  return children;
};

export default AuthGuard;