import { z } from "zod";

import { DataValidator } from "./data.js";

export const zodValidator =
  <T extends z.ZodType>(schema: T): DataValidator<z.output<T>> =>
  (data: unknown) => {
    return z.parse(schema, data);
  };
