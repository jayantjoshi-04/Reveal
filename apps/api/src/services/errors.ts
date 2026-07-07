/** Typed HTTP errors, mapped to status codes by the Fastify error handler. */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
export class NotFound extends HttpError {
  constructor(what: string) {
    super(404, `${what} not found`);
  }
}
export class BadRequest extends HttpError {
  constructor(msg: string) {
    super(400, msg);
  }
}
export class Conflict extends HttpError {
  constructor(msg: string) {
    super(409, msg);
  }
}
