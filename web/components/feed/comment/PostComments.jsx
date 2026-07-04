"use client";

import { useComments } from "@/hooks/useComments";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";
import styles from "./PostComments.module.css";

const PostComments = ({ postId, open }) => {
  const { data, isLoading, isError } = useComments(postId, open);

  if (!open) return null;

  const comments = data ?? [];

  return (
    <>
      <div className={styles.commentArea}>
        <CommentComposer postId={postId} />
      </div>
      <div className={styles.thread}>
        {isLoading && (
          <div className={styles.state}>Loading comments...</div>
        )}
        {isError && (
          <div className={styles.state}>Failed to load comments.</div>
        )}
        {!isLoading && !isError && comments.length > 0 && (
          <>
            {comments.length > 1 && (
              <div className={styles.previousComment}>
                <button type="button" className={styles.previousCommentButton}>
                  View {comments.length - 1} previous comments
                </button>
              </div>
            )}

            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                postId={postId}
                comment={{ ...comment, replies: comment.replies ?? [] }}
                depth={0}
              />
            ))}
          </>
        )}

        {!isLoading && !isError && comments.length === 0 && (
          <div className={styles.state}>No comments yet.</div>
        )}
      </div>
    </>
  );
};

export default PostComments;