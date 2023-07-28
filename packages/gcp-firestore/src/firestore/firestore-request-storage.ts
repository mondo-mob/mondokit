import { RequestStorageStore } from "@mondokit/gcp-core";
import { FirestoreLoader } from "./firestore-loader.js";

export const firestoreLoaderRequestStorage = new RequestStorageStore<FirestoreLoader>("_FIRESTORE_LOADER");
