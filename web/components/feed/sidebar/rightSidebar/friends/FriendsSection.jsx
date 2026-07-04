import { Search } from "lucide-react";
import Link from "next/link";
import { friends } from "@/mockData";
import FriendStatusCard from "./FriendStatusCard.jsx";
import styles from "./FriendsSection.module.css";

const FriendsSection = () => {
  return (
    <div
      className={`${styles.root} _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area`}
    >
      <div className={styles.stickyTop}>
        <div className={`${styles.header} _mar_b24`}>
          <h4 className="_title5">Your Friends</h4>
          <span>
            <Link className={styles.headerLink} href="">
              See All
            </Link>
          </span>
        </div>
        <form className={styles.form}>
          <Search className={styles.searchIcon} size={17} />
          <input
            className={styles.input}
            type="search"
            placeholder="Search friends"
            aria-label="Search"
          />
        </form>
      </div>
      <div className={styles.list}>
        {friends.map((friend, index) => (
          <FriendStatusCard key={`${friend.name}-${index}`} friend={friend} />
        ))}
      </div>
    </div>
  );
};

export default FriendsSection;