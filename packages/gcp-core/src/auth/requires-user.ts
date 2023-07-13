import { Handler } from "express";
import { userRequestStorageProvider } from "./user-request-storage-provider.js";
import { UnauthorisedError } from "../error/index.js";

/**
 * Middleware that checks for an authenticated user in the incoming request.
 */
export const requiresUser = (): Handler => (req, res, next) => {
  const userStorage = userRequestStorageProvider.get();
  const user = userStorage.get();
  if (!user) {
    return next(new UnauthorisedError("No authenticated user"));
  }
  next();
};
