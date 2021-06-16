import { Datastore, DatastoreOptions } from "@google-cloud/datastore";
import { Provider } from "@dotrun/gae-js-core";
import { connectDatastore } from "./connect";

export class DatastoreProvider extends Provider<Datastore> {
  init(datastoreOrOptions?: Datastore | DatastoreOptions): void {
    if (datastoreOrOptions instanceof Datastore) {
      this.set(datastoreOrOptions);
    } else {
      this.set(connectDatastore(datastoreOrOptions));
    }
  }
}

export const datastoreProvider = new DatastoreProvider();