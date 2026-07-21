import { Handler, NextFunction, Request, Response } from "express";

/**
 * @deprecated Express 5 natively supports async middleware and route handlers.
 * Rejected promises are forwarded to error-handling middleware without this wrapper.
 */
export type AsyncHandler = (req: Request, res: Response, next?: NextFunction) => Promise<unknown>;

/**
 * Convenience middleware for handling async middleware functions.
 * This WILL call next() for a successful promise (use asyncHandler() if you don't want that)
 * Any errors caught will be passed onto the configured error handling middleware
 *
 * @deprecated Express 5 natively supports async middleware. Use an `async` middleware
 * directly — rejected promises are forwarded to error-handling middleware without this wrapper.
 * Note: unlike this helper, native async middleware does not automatically call `next()` on success;
 * call `next()` yourself when the middleware should continue the chain.
 * @param handlerFn async middleware
 */
export const asyncMiddleware =
  (handlerFn: AsyncHandler): Handler =>
  (req, res, next) =>
    handlerFn(req, res, next)
      .then(() => next())
      .catch((error: unknown) => next(error));

/**
 * Convenience middleware for handling async handler functions.
 * This will NOT call next() for a successful promise (use asyncMiddleware() if you need that functionality)
 * Any errors caught will be passed onto the configured error handling middleware
 *
 * @deprecated Express 5 natively supports async route handlers. Use an `async` handler
 * directly — rejected promises are forwarded to error-handling middleware without this wrapper.
 * @param handlerFn async handler
 */
export const asyncHandler =
  (handlerFn: AsyncHandler): Handler =>
  (req, res, next) =>
    handlerFn(req, res, next).catch((error: unknown) => next(error));
