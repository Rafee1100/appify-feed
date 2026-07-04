CREATE TABLE IF NOT EXISTS comments (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  post_id           BIGINT UNSIGNED NOT NULL,
  author_id         BIGINT UNSIGNED NOT NULL,
  parent_comment_id BIGINT UNSIGNED NULL,
  content           TEXT NOT NULL,
  like_count        INT UNSIGNED NOT NULL DEFAULT 0,
  reply_count       INT UNSIGNED NOT NULL DEFAULT 0,
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_comments_post   FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  KEY idx_comments_post_parent_created (post_id, parent_comment_id, created_at, id),
  KEY idx_comments_parent_created (parent_comment_id, created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;