CREATE TABLE IF NOT EXISTS likes (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  target_type ENUM('post','comment') NOT NULL,
  target_id   BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_likes (user_id, target_type, target_id),
  KEY idx_likes_target_created (target_type, target_id, created_at, id),
  KEY idx_likes_user_created (user_id, created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;