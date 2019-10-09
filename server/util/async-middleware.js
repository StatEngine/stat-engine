'use strict';

export function asyncMiddleware(middleware) {
  // Wrap the middleware function with a try/catch block. This will deal with exceptions thrown in async function calls.
  // Without this, the server won't send an error to the client if one occurs within an async function call, causing
  // the client to hang if an uncaught exception occurs on the server.
  return async (req, res, next) => {
    try {
      await middleware(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}
