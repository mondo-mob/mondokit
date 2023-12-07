import { Handler } from "express";
import { Datastore } from "@google-cloud/datastore";
import { datastoreLoaderRequestStorage } from "../datastore/datastore-request-storage.js";
import { DatastoreLoader } from "../datastore/datastore-loader.js";
import { datastoreProvider } from "../datastore/datastore-provider.js";

/**
 * Creates a middleware that initialises a new DatastoreLoader into request storage
 * for each request from the provided Datastore instance.
 *
 * @param datastore datastore instance to use when creating Loader instances
 */
export const datastoreLoader = (datastore?: Datastore): Handler => {
  return (req, res, next) => {
    datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore || datastoreProvider.get()));
    next();
  };
};
