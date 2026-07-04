"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Earth,
  EllipsisVertical,
  Lock,
  MessageCircle,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { usePostLike, usePostLikedBy } from "@/hooks/useLike";
import { useDeletePost } from "@/hooks/usePosts";
import PostComments from "../comment/PostComments";
import LikesModal from "../likes/LikesModal";
import styles from "./FeedPost.module.css";

function formatPostTime(createdAt) {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return createdAt;

  const diffInMinutes = Math.max(
    1,
    Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60))
  );

  if (diffInMinutes < 60) return `${diffInMinutes} minute ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day ago`;
}

const FeedPost = ({ post, currentUserId }) => {
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const postLike = usePostLike();
  const deletePost = useDeletePost();
  const likedByQuery = usePostLikedBy(post.id, isLikesOpen);
  const menuRef = useRef(null);

  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  const authorAvatar = post.author.avatarUrl || "/assets/images/post_img.png";
  const postImage = post.imageUrl;
  const isOwnPost = currentUserId != null && currentUserId === post.author.id;

  const likedByUsers = useMemo(
    () => likedByQuery.data ?? [],
    [likedByQuery.data]
  );

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (e) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (!window.confirm("Delete this post?")) return;
    deletePost.mutate(post.id);
  };

  return (
    <div className={`${styles.root} _b_radious6 _padd_b24 _padd_t24 _mar_b16`}>
      <div className={`${styles.content} _padd_r24 _padd_l24`}>
        <div className={styles.top}>
          <div className={styles.postBox}>
            <div className={styles.postBoxImage}>
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className={styles.postImg}
              />
            </div>
            <div className={styles.postBoxText}>
              <h4 className={styles.postBoxTitle}>{authorName}</h4>
              <p className={styles.postBoxMeta}>
                {formatPostTime(post.createdAt)}
                <Link href="#0">
                  {post.visibility === "public" ? (
                    <Earth color="gray" height="13" />
                  ) : (
                    <Lock color="gray" height="13" />
                  )}
                </Link>
              </p>
            </div>
          </div>
          {isOwnPost && (
            <div className={styles.dropdownWrap} ref={menuRef}>
              <div className={styles.timelineDropdown}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={() => setIsMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  aria-label="Post actions"
                >
                  <EllipsisVertical color="gray" height="17" />
                </button>
              </div>

              <div
                className={`${styles.dropdown} ${
                  isMenuOpen ? styles.dropdownOpen : ""
                }`}
                role="menu"
              >
                <ul className={styles.dropdownList}>
                  <li className={styles.dropdownItem}>
                    <button
                      type="button"
                      className={`${styles.dropdownLink} ${styles.dropdownAction}`}
                      onClick={handleDelete}
                      role="menuitem"
                    >
                      <span>
                        <Trash2 color="red" height={15} />
                      </span>
                      Delete Post
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <h4 className={styles.title}>{post.content}</h4>
        {postImage && (
          <div className={styles.imageWrap}>
            <img src={postImage} alt={post.content} className={styles.image} />
          </div>
        )}
      </div>
      <div className={`${styles.reactsRow} _padd_r24 _padd_l24 _mar_b26`}>
        <div className={styles.reactsImages}>
          <Image
            src="/assets/images/react_img1.png"
            alt="Image"
            width={32}
            height={32}
            className={styles.reactImgPrimary}
          />
          <Image
            src="/assets/images/react_img2.png"
            alt="Image"
            width={32}
            height={32}
            className={styles.reactImg}
          />
          <Image
            src="/assets/images/react_img3.png"
            alt="Image"
            width={32}
            height={32}
            className={`${styles.reactImg} ${styles.hideOnSmall}`}
          />

          <button
            type="button"
            className={styles.reactCountButton}
            onClick={() => setIsLikesOpen(true)}
            aria-label="View likes"
          >
            +{post.likeCount}
          </button>
        </div>
        <div className={styles.reactsMeta}>
          <p className={styles.commentsMeta} onClick={() => setIsCommentsOpen((v) => !v)}>
            <span>{post.commentCount}</span> Comment
          </p>
          <p className={styles.sharesMeta}>
            <span>0</span> Share
          </p>
        </div>
      </div>
      <div className={styles.reactionBar}>
        <button
          type="button"
          className={`${styles.reactionButton} ${
            post.likedByMe ? styles.reactionButtonActive : ""
          }`}
          onClick={() => postLike.mutate(post.id)}
          disabled={postLike.status === "pending"}
          aria-pressed={post.likedByMe}
        >
          <span className={styles.reactionLink}>
            <span>
              <ThumbsUp color={post.likedByMe ? "blue" : "gray"} height={15} />
              {post.likedByMe ? "Liked" : "Like"}
            </span>
          </span>
        </button>
        <button
          type="button"
          className={styles.reactionButton}
          onClick={() => setIsCommentsOpen((v) => !v)}
          aria-pressed={isCommentsOpen}
        >
          <span className={styles.reactionLink}>
            <span>
              <MessageCircle color="gray" height={15} />
              Comment
            </span>
          </span>
        </button>
        <button className={styles.reactionButton}>
          <span className={styles.reactionLink}>
            <span>
              <Share2 color="gray" height={15} />
              Share
            </span>
          </span>
        </button>
      </div>

      <LikesModal
        open={isLikesOpen}
        onClose={() => setIsLikesOpen(false)}
        users={likedByUsers}
        isLoading={likedByQuery.isLoading}
        error={
          likedByQuery.error instanceof Error
            ? likedByQuery.error.message
            : null
        }
        ariaLabel="Post likes"
      />

      <PostComments postId={post.id} open={isCommentsOpen} />
    </div>
  );
};

export default FeedPost;