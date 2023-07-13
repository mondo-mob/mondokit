import { RequestStorageStore } from "../request-storage/index.js";
import { AuthUser } from "./auth-user.js";
import { Provider } from "../util/index.js";

export class UserRequestStorageProvider<U extends AuthUser, T extends RequestStorageStore<U>> extends Provider<T> {}

export const userRequestStorageProvider = new UserRequestStorageProvider(
  undefined,
  "No User request storage instance found. Please initialise userRequestStorageProvider."
);
