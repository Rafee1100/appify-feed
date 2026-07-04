import { events } from "@/mockData";
import EventCard from "./EventCard.jsx";
import styles from "./EventsSection.module.css";

const EventsSection = () => {
  return (
    <div
      className={`${styles.root} _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area`}
    >
      <div className={styles.header}>
        <h4 className={`${styles.title} _title5`}>Events</h4>
        <a href="#0" className={styles.link}>
          See all
        </a>
      </div>
      <hr className={styles.divider} />
      {events.map((event) => (
        <EventCard
          key={`${event.day}-${event.month}-${event.title}`}
          day={event.day}
          month={event.month}
          title={event.title}
          goingText={event.goingText}
          image={event.image}
        />
      ))}
    </div>
  );
};

export default EventsSection;