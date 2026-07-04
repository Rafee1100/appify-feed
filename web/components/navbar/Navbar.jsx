"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  House,
  LogOut,
  MessageCircleMore,
  Search,
  Users,
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import NavbarUserName from "./NavbarUserName.jsx";
import styles from "./Navbar.module.css";

function NavbarSearch() {
  return (
    <div className="_header_form ms-auto">
      <form
        className="_header_form_grp"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search className="_header_form_svg" size={17} color="#666" />
        <input
          className="form-control me-2 _inpt1"
          type="search"
          placeholder="Search"
          aria-label="Search"
        />
      </form>
    </div>
  );
}

function NavbarIcons({ items }) {
  return (
    <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
      {items.map(({ key, href, active, icon, count }) => (
        <li key={key} className="nav-item _header_nav_item">
          <Link
            className={`nav-link _header_nav_link${active ? " _header_nav_link_active" : ""}`}
            aria-current={active ? "page" : undefined}
            href={href}
          >
            {icon}
            {typeof count === "number" && (
              <span className="_counting">{count}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NavbarProfileMenu({
  open,
  onToggle,
  onClose,
  onLogout,
  isLoggingOut,
  menuRef,
}) {
  return (
    <div className="_header_nav_profile" ref={menuRef}>
      <div className="_header_nav_profile_image">
        <Image
          src="/assets/images/profile.png"
          alt="Image"
          className="_nav_profile_img"
          width={40}
          height={40}
        />
      </div>

      <div className="_header_nav_dropdown">
        <p className="_header_nav_para">
          <NavbarUserName fallback="" />
        </p>
        <button
          id="_profile_drop_show_btn"
          className="_header_nav_dropdown_btn _dropdown_toggle"
          type="button"
          aria-expanded={open}
          aria-controls="_prfoile_drop"
          onClick={onToggle}
        >
          <ChevronDown color="gray" height={20} />
        </button>
      </div>

      <div
        id="_prfoile_drop"
        className={`_nav_profile_dropdown _profile_dropdown ${open ? "show" : ""}`}
      >
        <ul className="_nav_dropdown_list">
          <li className="_nav_dropdown_list_item">
            <button
              type="button"
              className={`_nav_dropdown_link ${styles.dropdownAction}`}
              onClick={() => {
                onClose();
                onLogout();
              }}
              disabled={isLoggingOut}
            >
              <div className="_nav_drop_info">
                <span>
                  <LogOut size={18} color="#377DFF" />
                </span>
                Log Out
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

const Navbar = () => {
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onPointerDown(e) {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target))
        setMenuOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const iconItems = [
    {
      key: "home",
      href: "/feed",
      active: true,
      icon: <House size={22} color="#666" className={styles.homeIcon} />,
    },
    { key: "users", href: "", icon: <Users size={20} color="#666" /> },
    {
      key: "notifications",
      href: "#0",
      icon: <Bell size={22} color="#666" />,
      count: 2,
    },
    {
      key: "messages",
      href: "#0",
      icon: <MessageCircleMore size={22} color="#666" />,
      count: 2,
    },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
      <div className="container _custom_container">
        <div className="_logo_wrap">
          <Link className="navbar-brand" href="/feed">
            <Image
              src="/assets/images/logo.svg"
              alt="Image"
              className="_nav_logo"
              width={100}
              height={50}
            />
          </Link>
        </div>

        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <NavbarSearch />
          <NavbarIcons items={iconItems} />
          <NavbarProfileMenu
            open={menuOpen}
            onToggle={() => setMenuOpen((v) => !v)}
            onClose={() => setMenuOpen(false)}
            onLogout={() => logout.mutate()}
            isLoggingOut={logout.isPending}
            menuRef={menuRef}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;