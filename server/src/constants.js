const VISIBILITY = Object.freeze({ PUBLIC: "public", PRIVATE: "private" });
const TARGET_TYPE = Object.freeze({ POST: "post", COMMENT: "comment" });

const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: "ValidationError",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "NotFound",
  CONFLICT: "Conflict",
  RATE_LIMITED: "RateLimited",
  FILE_UPLOAD_ERROR: "FileUploadError",
  INTERNAL: "InternalError",
});

export { VISIBILITY, TARGET_TYPE, ERROR_CODES };