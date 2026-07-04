import multer from 'multer';
import createError from 'http-errors';
import env from '../config/env.js';
import { ERROR_CODES } from '../constants.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(createError(400, 'Only JPG, PNG, or WEBP images are allowed', {
      code: ERROR_CODES.VALIDATION_ERROR,
    }));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024 },
});

export default upload;