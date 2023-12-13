import { Logger } from "./logger/logger.js";
import { RequestStorageStore } from "../request-storage/request-storage-store.js";

const storageKey = "_LOGGER";
export const loggingRequestStorage = new RequestStorageStore<Logger>(storageKey);
