import EventsSection from "./events/EventsSection.jsx";
import ExploreSection from "./explore/ExploreSection.jsx";
import styles from "./FeedLeftSidebar.module.css";

const FeedLeftSidebar = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <ExploreSection />
        <EventsSection />
      </div>
    </div>
  );
};

export default FeedLeftSidebar;