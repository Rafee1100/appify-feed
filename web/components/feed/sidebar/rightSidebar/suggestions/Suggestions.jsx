import { suggestedPeople } from "@/mockData";
import SuggestedPersonCard from "./SuggestedPersonCard.jsx";
import styles from "./Suggestions.module.css";

const Suggestions = () => {
  return (
    <div
      className={`${styles.root} _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area`}
    >
      <div className={`${styles.header} _mar_b24`}>
        <h4 className="_title5">You Might Like</h4>
        <span>
          <a className={styles.headerLink} href="#0">
            See All
          </a>
        </span>
      </div>
      <hr className={styles.divider} />
      {suggestedPeople.map((person) => (
        <SuggestedPersonCard
          key={person.name}
          name={person.name}
          title={person.title}
          image={person.image}
        />
      ))}
    </div>
  );
};

export default Suggestions;