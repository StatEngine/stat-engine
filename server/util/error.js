
export class RequestError extends Error {
  constructor(message, type, statusCode) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, RequestError);
  }
}

export class BadRequestError extends RequestError {
  constructor(message, type = 'BadRequestError') {
    super(message, type, 400);
    Error.captureStackTrace(this, BadRequestError);
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message, type = 'UnathorizedError') {
    super(message, type, 401);
    Error.captureStackTrace(this, UnauthorizedError);
  }
}

export class ForbiddenError extends RequestError {
  constructor(message, type = 'ForbiddenError') {
    super(message, type, 403);
    Error.captureStackTrace(this, ForbiddenError);
  }
}

export class NotFoundError extends RequestError {
  constructor(message, type = 'NotFound') {
    super(message, type, 404);
    Error.captureStackTrace(this, NotFoundError);
  }
}

export class UnprocessableEntityError extends RequestError {
  constructor(message, type = 'UnprocessableEntityError') {
    super(message, type, 422);
    Error.captureStackTrace(this, UnprocessableEntityError);
  }
}

export class InternalServerError extends RequestError {
  constructor(message, type = 'InternalServerError') {
    super(message, type, 500);
    Error.captureStackTrace(this, InternalServerError);
  }
}
