-- Required by rate-limiter-flexible. Schema mirrors what the package would auto-create.
CREATE TABLE IF NOT EXISTS rate_limit (
  `key`    VARCHAR(255) CHARACTER SET utf8 NOT NULL,
  `points` INT(9) NOT NULL DEFAULT 0,
  `expire` BIGINT UNSIGNED,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;