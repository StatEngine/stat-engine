'use strict';

export function asyncMiddleware(middleware) {
  // Wrap the middleware with a try/catch block. This will deal with exceptions thrown in middleware that
  // use async/await. Without this, the server won't send an error to the client if one occurs within
  // async middleware, causing the client to hang if an uncaught exception occurs on the server.
  return async (req, res, next) => {
    try {
      await middleware(req, res, next)
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
}
