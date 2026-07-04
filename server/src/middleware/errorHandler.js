import { ERROR_CODES } from "../constants.js";

export default function errorHandler(err, req, res, _next) {
  if (err && err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      err: ERROR_CODES.FILE_UPLOAD_ERROR,
      message: err.message,
    });
  }

  if (err && err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: ERROR_CODES.CONFLICT,
      message: "Resource already exists",
    });
  }

  if (
    err &&
    typeof err.status === "number" &&
    err.status >= 400 &&
    err.status < 600
  ) {
    return res.status(err.status).json({
      error: err.code || ERROR_CODES.INTERNAL,
      message: err.message,
      ...(err.data?.fields ? { fields: err.data.fields } : {}),
    });
  }

  console.error("[unhandled]", err && err.stack ? err.stack : err);
  return res.status(500).json({
    error: ERROR_CODES.INTERNAL,
    message: "Something went wrong. Please try again.",
    detail: err && err.message ? err.message : undefined,
  });
}
