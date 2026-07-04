import createError from 'http-errors';
import { ERROR_CODES } from '../constants.js';

export default function notFound(_req, _res, next) {
  next(createError(404, 'Not found', { code: ERROR_CODES.NOT_FOUND }));
};