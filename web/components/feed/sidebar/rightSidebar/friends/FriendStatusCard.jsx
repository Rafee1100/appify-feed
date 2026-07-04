import Image from "next/image";
import Link from "next/link";
import { Dot } from "lucide-react";
import styles from "./FriendStatusCard.module.css";

const FriendStatusCard = ({ friend }) => {
  const {
    name,
    title,
    image,
    profileHref = "#",
    statusType,
    statusText,
  } = friend;
  return (
    <div
      className={`${styles.card}${statusType === "time" ? ` ${styles.inactive}` : ""}`}
    >
      <div className={styles.box}>
        <div className={styles.imageWrap}>
          <Link href={profileHref}>
            <Image
              src={image}
              alt=""
              className={styles.image}
              width={20}
              height={20}
            />
          </Link>
        </div>
        <div className={styles.text}>
          <Link href={profileHref}>
            <h4 className={styles.title}>{name}</h4>
          </Link>
          <p className={styles.description}>{title}</p>
        </div>
      </div>
      <div className={styles.side}>
        {statusType === "online" ? (
          <Dot color="green" width={40} height={40} />
        ) : (
          <span className={styles.statusText}>{statusText}</span>
        )}
      </div>
    </div>
  );
};

export default FriendStatusCard;