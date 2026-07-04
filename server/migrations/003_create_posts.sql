CREATE TABLE IF NOT EXISTS posts (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  author_id     BIGINT UNSIGNED NOT NULL,
  content       TEXT NOT NULL,
  image_url     VARCHAR(500) NULL,
  visibility    ENUM('public','private') NOT NULL DEFAULT 'public',
  like_count    INT UNSIGNED NOT NULL DEFAULT 0,
  comment_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_posts_feed (visibility, created_at, id),
  KEY idx_posts_author_created (author_id, created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;