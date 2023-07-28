import { Firestore, Settings } from "@google-cloud/firestore";
import { Provider } from "@mondokit/gcp-core";
import { connectFirestore } from "./connect.js";

export class FirestoreProvider extends Provider<Firestore> {
  init(firestoreOrSettings?: Firestore | Settings): void {
    if (firestoreOrSettings instanceof Firestore) {
      this.set(firestoreOrSettings);
    } else {
      this.set(connectFirestore({ firestoreSettings: firestoreOrSettings }));
    }
  }
}

export const firestoreProvider = new FirestoreProvider(
  undefined,
  "No Firestore instance found. Please initialise firestoreProvider."
);
