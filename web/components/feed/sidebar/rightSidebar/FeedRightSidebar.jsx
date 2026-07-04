import Suggestions from "./suggestions/Suggestions.jsx";
import FriendsSection from "./friends/FriendsSection.jsx";
import styles from "./FeedRightSidebar.module.css";

const FeedRightSidebar = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <Suggestions />
      </div>
      <div className={styles.inner}>
        <FriendsSection />
      </div>
    </div>
  );
};

export default FeedRightSidebar;