import { RequestStorageStore } from "../request-storage/request-storage-store.js";
import { AuthUser } from "./auth-user.js";
import { Provider } from "../util/provider.js";

export class UserRequestStorageProvider<U extends AuthUser, T extends RequestStorageStore<U>> extends Provider<T> {}

export const userRequestStorageProvider = new UserRequestStorageProvider(
  undefined,
  "No User request storage instance found. Please initialise userRequestStorageProvider."
);
