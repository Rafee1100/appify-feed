import Link from "next/link";
import { exploreEvents } from "@/mockData";
import styles from "./ExploreSection.module.css";

const ExploreSection = () => {
  return (
    <div
      className={`${styles.root} _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area`}
    >
      <h4 className={styles.title}>Explore</h4>
      <ul className={styles.list}>
        {exploreEvents.map((event, index) => (
          <li key={index} className={styles.item}>
            <Link href="" className={styles.link}>
              <event.Icon className={styles.icon} size={18} />
              {event.title}
            </Link>
            {event.isNew && <span className={styles.badge}>New</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExploreSection;