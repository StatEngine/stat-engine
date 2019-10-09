'use strict';

export function asyncParam(paramFunc) {
  // Wrap the param function with a try/catch block. This will deal with exceptions thrown in async function calls.
  // Without this, the server won't send an error to the client if one occurs within an async function call, causing
  // the client to hang if an uncaught exception occurs on the server.
  return async (req, res, next, id) => {
    try {
      await paramFunc(req, res, next, id);
    } catch (err) {
      next(err);
    }
  }
}
