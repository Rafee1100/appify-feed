import Link from "next/link";
import Image from "next/image";
import styles from "./SuggestedPersonCard.module.css";

const SuggestedPersonCard = ({
  name,
  title,
  image,
  profileHref = "#0",
}) => {
  return (
    <div className={styles.root}>
      <div className={styles.person}>
        <div className={styles.box}>
          <div className={styles.imageWrap}>
            <Link href={profileHref}>
              <Image
                src={image}
                alt="Image"
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
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.button}>
          Ignore
        </button>
        <button type="button" className={`${styles.button} ${styles.buttonActive}`}>
          Follow
        </button>
      </div>
    </div>
  );
};

export default SuggestedPersonCard;