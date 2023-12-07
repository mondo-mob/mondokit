import { Datastore, DatastoreOptions } from "@google-cloud/datastore";
import { Provider } from "@mondokit/gcp-core";
import { connectDatastore } from "./connect.js";

export class DatastoreProvider extends Provider<Datastore> {
  init(datastoreOrOptions?: Datastore | DatastoreOptions): void {
    if (datastoreOrOptions instanceof Datastore) {
      this.set(datastoreOrOptions);
    } else {
      this.set(connectDatastore({ datastoreOptions: datastoreOrOptions }));
    }
  }
}

export const datastoreProvider = new DatastoreProvider(
  undefined,
  "No Datastore instance found. Please initialise datastoreProvider."
);
