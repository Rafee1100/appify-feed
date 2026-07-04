import { Bell, House, Menu, MessageCircleMore, Users } from "lucide-react";
import Link from "next/link";

const FeedMobileBottomNav = () => {
  return (
    <nav className="_mobile_navigation_bottom_wrapper" aria-label="Mobile navigation">
      <ul className="_mobile_navigation_bottom_list">
        <li className="_mobile_navigation_bottom_item">
          <Link
            href="/feed"
            className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active"
            aria-label="Home"
          >
            <House color="gray" height={35} />
          </Link>
        </li>

        <li className="_mobile_navigation_bottom_item">
          <a href="#0" className="_mobile_navigation_bottom_link" aria-label="Friends">
            <Users color="gray" height={35} />
          </a>
        </li>

        <li className="_mobile_navigation_bottom_item">
          <a href="#0" className="_mobile_navigation_bottom_link" aria-label="Notifications">
            <Bell color="gray" height={35} />
            <span className="_counting">6</span>
          </a>
        </li>

        <li className="_mobile_navigation_bottom_item">
          <a href="#0" className="_mobile_navigation_bottom_link" aria-label="Messages">
            <MessageCircleMore color="gray" height={35} />
            <span className="_counting">2</span>
          </a>
        </li>

        <li className="_mobile_navigation_bottom_item">
          <button
            type="button"
            className="_header_mobile_btn_link _mobile_navigation_bottom_link"
            aria-label="Open mobile menu"
          >
            <Menu color="gray" height={35} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default FeedMobileBottomNav;