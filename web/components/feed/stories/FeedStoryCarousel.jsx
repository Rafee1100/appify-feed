"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveRight, Plus } from "lucide-react";
import { mobileStories, publicStories } from "@/mockData";
import styles from "./FeedStoryCarousel.module.css";

const DESKTOP_VISIBLE_COUNT = 3;

const getVisibleStories = (stories, startIndex) => {
  if (stories.length <= DESKTOP_VISIBLE_COUNT) return stories;
  return Array.from({ length: DESKTOP_VISIBLE_COUNT }, (_, i) => {
    const idx = (startIndex + i) % stories.length;
    return stories[idx];
  });
};

const getDesktopGrid = (index) => {
  if (index === 1) return "col-xl-3 col-lg-3 col-md-4 col-sm-4 _custom_mobile_none";
  if (index === 2) return "col-xl-3 col-lg-3 col-md-4 col-sm-4 _custom_none";
  return "col-xl-3 col-lg-3 col-md-4 col-sm-4 col";
};

const getMobileStoryAreaClass = (type, styles) => {
  if (type === "active") return styles.storyAreaActive;
  if (type === "inactive") return styles.storyAreaInactive;
  return styles.storyArea;
};

const FeedStoryCarousel = () => {
  const [startIndex, setStartIndex] = useState(0);

  const visibleStories = useMemo(
    () => getVisibleStories(publicStories, startIndex),
    [startIndex]
  );

  const handleNext = useCallback(() => {
    if (!publicStories.length) return;
    setStartIndex((prev) => (prev + 1) % publicStories.length);
  }, []);

  return (
    <div>
      <div className={`${styles.desktopCard} _mar_b16`}>
        <div className={styles.storyArrow}>
          <button
            type="button"
            className={styles.storyArrowButton}
            onClick={handleNext}
            aria-label="Next story"
          >
            <MoveRight color="white" width={12} />
          </button>
        </div>

        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
            <div className={`${styles.profileStory} _b_radious6`}>
              <div className={styles.profileStoryImage}>
                <Image
                  src="/assets/images/card_ppl1.png"
                  alt="Your story"
                  className={styles.profileStoryImg}
                  width={50}
                  height={50}
                />
                <div className={styles.storyText}>
                  <div className={styles.storyButtonWrap}>
                    <button className={styles.storyButton} type="button" aria-label="Add story">
                      <Plus color="white" width={12} />
                    </button>
                  </div>
                  <p className={styles.storyTextLabel}>Your Story</p>
                </div>
              </div>
            </div>
          </div>

          {visibleStories.map((story, index) => (
            <div key={`${story.image}-${index}`} className={getDesktopGrid(index)}>
              <div className={`${styles.publicStory} _b_radious6`}>
                <div className={styles.publicStoryImageWrap}>
                  <Image
                    src={story.image}
                    alt={story.name}
                    className={styles.publicStoryImg}
                    width={50}
                    height={50}
                  />
                  <div className={styles.publicStoryText}>
                    <p className={styles.publicStoryTextLabel}>{story.name}</p>
                  </div>
                  <div className={styles.publicStoryMini}>
                    <Image
                      src={story.miniImage}
                      alt=""
                      className={styles.publicMiniImg}
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.mobileCard} _mar_b16`}>
        <div className={styles.storyAreaWrap}>
          <ul className={styles.storyAreaList}>
            {mobileStories.map((story, index) => {
              const key = `${story.type}-${story.image}-${index}`;

              if (story.type === "your") {
                return (
                  <li key={key} className={styles.storyAreaItem}>
                    <Link href="#0" className={styles.storyAreaLink}>
                      <div className={styles.storyArea}>
                        <Image
                          src={story.image}
                          alt={story.label}
                          className={styles.storyImg}
                          width={50}
                          height={50}
                        />
                        <div className={styles.storyPlusButtonWrap}>
                          <button
                            className={styles.storyPlusButton}
                            type="button"
                            aria-label="Add story"
                          >
                            <Plus color="white" width={12} />
                          </button>
                        </div>
                      </div>
                      <p className={styles.storyAreaLinkLabel}>{story.label}</p>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={key} className={styles.storyAreaItem}>
                  <Link href="#0" className={styles.storyAreaLink}>
                    <div className={getMobileStoryAreaClass(story.type, styles)}>
                      <Image
                        src={story.image}
                        alt={story.label}
                        className={styles.storyImgAlt}
                        width={50}
                        height={50}
                      />
                    </div>
                    <p className={styles.storyAreaTextLabel}>{story.label}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedStoryCarousel;