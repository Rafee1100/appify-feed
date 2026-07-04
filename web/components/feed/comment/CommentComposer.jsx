"use client";

import { useState } from "react";
import Image from "next/image";
import { Mic, Images } from "lucide-react";
import { useCreateComment } from "@/hooks/useComments";
import styles from "./CommentComposer.module.css";

const CommentComposer = ({
  postId,
  parentCommentId,
  placeholder = "Write a comment",
  onSubmitted,
}) => {
  const createComment = useCreateComment(postId);
  const [content, setContent] = useState("");

  const isSubmitting = createComment.status === "pending";

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    createComment.mutate(
      { content: trimmed, parentCommentId },
      {
        onSuccess: () => {
          setContent("");
          onSubmitted?.();
        },
      }
    );
  };

  return (
    <div className={styles.commentBox}>
      <form
        className={styles.commentForm}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className={styles.commentContent}>
          <div className={styles.commentContentImage}>
            <Image
              src="/assets/images/comment_img.png"
              alt=""
              width={20}
              height={20}
              className={styles.commentAvatar}
            />
          </div>
          <div className={styles.commentContentText}>
            <textarea
              className={`form-control ${styles.commentTextarea}`}
              placeholder={placeholder}
              value={content}
              disabled={isSubmitting}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </div>
        </div>

        <div className={styles.commentIcon}>
          <button
            type="button"
            className={styles.commentIconButton}
            aria-label="Voice note (not implemented)"
          >
            <Mic color="gray" height={15} />
          </button>

          <button
            type="button"
            className={styles.commentIconButton}
            aria-label="Attach image (not implemented)"
          >
            <Images color="gray" height={15} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentComposer;