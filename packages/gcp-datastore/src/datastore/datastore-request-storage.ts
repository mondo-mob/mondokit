import { RequestStorageStore } from "@mondokit/gcp-core";
import { DatastoreLoader } from "./datastore-loader.js";

export const datastoreLoaderRequestStorage = new RequestStorageStore<DatastoreLoader>("_DATASTORE_LOADER");
