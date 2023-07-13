import { SearchService } from "./search.service.js";
import { Provider } from "../util/index.js";

export const searchProvider = new Provider<SearchService>(
  undefined,
  "No SearchService instance found. Please initialise searchProvider."
);
