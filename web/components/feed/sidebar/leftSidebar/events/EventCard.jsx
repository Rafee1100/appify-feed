import Image from "next/image";
import Link from "next/link";
import styles from "./EventCard.module.css";

const EventCard = ({
  day,
  month,
  title,
  goingText,
  image,
  href = "#0",
}) => {
  return (
    <Link href={href} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.imageWrap}>
          <Image
            src={image}
            alt="Image"
            className={styles.image}
            width={500}
            height={300}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.date}>
            <p className={styles.day}>{day}</p>
            <p className={styles.month}>{month}</p>
          </div>
          <div className={styles.text}>
            <h4 className={styles.title}>{title}</h4>
          </div>
        </div>
        <hr className={styles.divider} />
        <div className={styles.bottom}>
          <p className={styles.goingText}>{goingText}</p>
          <span className={styles.goingLink}>Going</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;