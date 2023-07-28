import { Handler } from "express";
import { Firestore } from "@google-cloud/firestore";
import { firestoreLoaderRequestStorage } from "../firestore/firestore-request-storage.js";
import { FirestoreLoader } from "../firestore/firestore-loader.js";
import { firestoreProvider } from "../firestore/firestore-provider.js";

/**
 * Creates a middleware that initialises a new FirestoreLoader into request storage
 * for each request from the provided Firestore instance.
 *
 * @param firestore firestore instance to use when creating Loader instances
 */
export const firestoreLoader = (firestore?: Firestore): Handler => {
  return (req, res, next) => {
    firestoreLoaderRequestStorage.set(new FirestoreLoader(firestore || firestoreProvider.get()));
    next();
  };
};
