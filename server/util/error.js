
export function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    console.error(err);
    return res.status(statusCode).json(err);
  };
}

export function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err);
    return res.status(statusCode).send(err);
  };
}
