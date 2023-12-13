import { HttpError } from "./http-error.js";

export class UnauthorisedError extends HttpError {
  constructor(
    message?: string,
    readonly code = "unauthorised",
  ) {
    super(401, message || "Unauthorised", code);
  }
}
