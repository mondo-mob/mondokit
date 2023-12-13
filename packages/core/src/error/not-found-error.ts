import { HttpError } from "./http-error.js";

export class NotFoundError extends HttpError {
  constructor(
    message?: string,
    readonly code = "not.found",
  ) {
    super(404, message || "Not Found", code);
  }
}
