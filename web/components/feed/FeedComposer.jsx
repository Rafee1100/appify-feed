"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Earth,
  File,
  Images,
  Lock,
  PencilLine,
  Send,
  Video,
} from "lucide-react";
import { useCreatePost } from "@/hooks/usePosts";
import styles from "./FeedComposer.module.css";

const FeedComposer = () => {
  const createPost = useCreatePost();
  const fileInputRef = useRef(null);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [visibility, setVisibility] = useState("public");

  const isSubmitting = createPost.status === "pending";

  const handlePickImage = () => {
    if (isSubmitting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const clearImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed && !imageFile) return;

    createPost.mutate(
      {
        content: trimmed,
        image: imageFile ?? undefined,
        visibility,
      },
      {
        onSuccess: () => {
          setContent("");
          clearImage();
        },
      },
    );
  };

  return (
    <div
      className={`${styles.root} _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16`}
    >
      <div className={styles.box}>
        <div className={`form-floating ${styles.form}`}>
          <div className={styles.privacyOverlay}>
            <span className={styles.privacyIcon} aria-hidden="true">
              {visibility === "public" ? (
                <Earth color="gray" height={15} />
              ) : (
                <Lock color="gray" height={15} />
              )}
            </span>
            <select
              className={styles.privacySelect}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={isSubmitting}
              aria-label="Post visibility"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <textarea
            className={`form-control ${styles.textarea}`}
            placeholder="Leave a comment here"
            id="floatingTextarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {!content.trim() && !imageFile && (
            <label className={styles.label} htmlFor="floatingTextarea">
              Write something ...
              <PencilLine color="gray" height={15} />
            </label>
          )}
        </div>
      </div>

      {imageFile && imagePreviewUrl && (
        <div className={styles.previewRow} aria-live="polite">
          <div className={styles.previewCard}>
            <div className={styles.previewThumbWrap}>
              <Image
                src={imagePreviewUrl}
                alt="Selected upload preview"
                width={100}
                height={100}
                className={styles.previewThumb}
              />
              {isSubmitting && (
                <div className={styles.previewOverlay}>
                  <div className={styles.spinner} aria-hidden="true" />
                  <div className={styles.previewOverlayText}>Uploading…</div>
                </div>
              )}
            </div>

            <div className={styles.previewMeta}>
              <div className={styles.previewName} title={imageFile.name}>
                {imageFile.name}
              </div>
              <div className={styles.previewHint}>
                {isSubmitting ? "Uploading image" : "Ready to upload"}
              </div>
            </div>

            <button
              type="button"
              className={styles.previewRemove}
              onClick={clearImage}
              disabled={isSubmitting}
              aria-label="Remove selected image"
              title="Remove"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <div className={styles.bottom}>
        <div className={styles.item}>
          <div className={styles.common}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handlePickImage}
              disabled={isSubmitting}
            >
              <span className={`${styles.iconWrap} _mar_img`}>
                <Images color="gray" height={15} />
              </span>
              Photo
            </button>
          </div>
          <div className={styles.common}>
            <button type="button" className={styles.actionButton}>
              <span className={`${styles.iconWrap} _mar_img`}>
                <Video color="gray" height={15} />
              </span>
              Video
            </button>
          </div>
          <div className={styles.common}>
            <button type="button" className={styles.actionButton}>
              <span className={`${styles.iconWrap} _mar_img`}>
                <Calendar color="gray" height={15} />
              </span>
              Event
            </button>
          </div>
          <div className={styles.common}>
            <button type="button" className={styles.actionButton}>
              <span className={`${styles.iconWrap} _mar_img`}>
                <File color="gray" height={15} />
              </span>
              Article
            </button>
          </div>
        </div>
        <div className={styles.submitWrap}>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Send color="white" height={15} />
            <span>Post</span>
          </button>
        </div>
      </div>

      <div className={styles.mobileBottom}>
        <div className={styles.mobileInner}>
          <div className={styles.item}>
            <div className={styles.common}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handlePickImage}
              >
                <span className={`${styles.iconWrap} _mar_img`}>
                  <Images color="gray" height={15} />
                </span>
              </button>
            </div>
            <div className={styles.common}>
              <button type="button" className={styles.actionButton}>
                <span className={`${styles.iconWrap} _mar_img`}>
                  <Video color="gray" height={15} />
                </span>
              </button>
            </div>
            <div className={styles.common}>
              <button type="button" className={styles.actionButton}>
                <span className={`${styles.iconWrap} _mar_img`}>
                  <Calendar color="gray" height={15} />
                </span>
              </button>
            </div>
            <div className={styles.common}>
              <button type="button" className={styles.actionButton}>
                <span className={`${styles.iconWrap} _mar_img`}>
                  <File color="gray" height={15} />
                </span>
              </button>
            </div>
          </div>
          <div className={styles.submitWrap}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send color="white" height={15} />
              {isSubmitting ? (
                <span className={styles.submitting}>
                  <span className={styles.spinnerInline} aria-hidden="true" />
                  Posting…
                </span>
              ) : (
                <span>Post</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedComposer;
