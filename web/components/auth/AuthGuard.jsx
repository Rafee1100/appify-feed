"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken } from "@/lib/tokenStorage";

const AuthGuard = ({ children }) => {
  const router = useRouter();

  const access = getAccessToken();
  const refresh = getRefreshToken();
  const isAuthed = Boolean(access || refresh);

  useEffect(() => {
    if (!isAuthed) {
      router.replace("/auth/login");
    }
  }, [isAuthed, router]);

  if (!isAuthed) {
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