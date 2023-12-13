import { HttpError } from "./http-error.js";

export class ForbiddenError extends HttpError {
  constructor(
    message?: string,
    readonly code = "forbidden",
  ) {
    super(403, message || "Forbidden", code);
  }
}
