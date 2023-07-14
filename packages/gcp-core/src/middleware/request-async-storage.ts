import { Handler } from "express";
import { loggingRequestStorage } from "../logging/logging-request-storage.js";
import { runWithRequestStorage } from "../request-storage/request-storage.js";

export const requestAsyncStorage: Handler = (req, res, next) => {
  runWithRequestStorage(() => {
    try {
      if ((req as any).log) {
        loggingRequestStorage.set((req as any).log);
      }
      next();
    } catch (e) {
      next(e);
    }
  });
};
