"use client";

import { useAuth } from "@/hooks/useAuth";

const NavbarUserName = ({ fallback = "User" }) => {
  const { user } = useAuth();

  const name = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  return <>{name || fallback}</>;
};

export default NavbarUserName;