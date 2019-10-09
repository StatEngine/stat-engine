'use strict';

export function asyncParam(paramFunc) {
  return async (req, res, next, id) => {
    try {
      await paramFunc(req, res, next, id);
    } catch (err) {
      next(err);
    }
  }
}
