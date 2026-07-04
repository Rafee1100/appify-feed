import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FeedMobileMenu = () => {
  return (
    <div className="_header_mobile_menu">
      <div className="container">
        <div className="_header_mobile_menu_top_inner">
          <div className="_header_mobile_menu_logo">
            <Link href="/feed" className="_mobile_logo_link">
              <Image
                src="/assets/images/logo.svg"
                alt="Image"
                width={100}
                height={50}
                className="_nav_logo"
              />
            </Link>
          </div>

          <div className="_header_mobile_menu_right">
            <form className="_header_form_grp">
              <Link href="#0" className="_header_mobile_search" aria-label="Search">
                <Search color="gray" height={15} />
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedMobileMenu;