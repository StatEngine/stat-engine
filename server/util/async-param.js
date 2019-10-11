'use strict';

export function asyncParam(paramFunc) {
  // This is essentially the same as asyncMiddleware but specifically for route.param(), which requires
  // a different function signature. Attempting to use asyncMiddleware and asyncParam interchangeably will
  // cause errors.
  return async (req, res, next, id) => {
    try {
      await paramFunc(req, res, next, id);
    } catch (err) {
      next(err);
    }
  }
}
