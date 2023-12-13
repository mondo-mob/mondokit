import { ZodType } from "zod";
import { DataValidator } from "./data.js";

export const zodValidator =
  <T>(schema: ZodType<T>): DataValidator<T> =>
  (data: unknown) => {
    return schema.parse(data);
  };
