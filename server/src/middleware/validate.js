import { ZodError } from 'zod';
import createError from 'http-errors';
import { ERROR_CODES } from '../constants.js';

function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body)   req.body   = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query)  req.query  = schemas.query.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fields = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.');
          if (!fields[path]) fields[path] = issue.message;
        }
        return next(createError(400, 'Invalid input', {
          code: ERROR_CODES.VALIDATION_ERROR,
          data: { fields },
        }));
      }
      next(err);
    }
  };
}

export default validate;