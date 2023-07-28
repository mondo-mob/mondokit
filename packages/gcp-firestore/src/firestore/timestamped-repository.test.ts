import { Firestore } from "@google-cloud/firestore";
import { runWithRequestStorage, setRequestStorageValue } from "@mondokit/gcp-core";
import {
  DISABLE_TIMESTAMP_UPDATE,
  newTimestampedEntity,
  TimestampedEntity,
  TimestampedRepository,
} from "./timestamped-repository.js";
import { useFirestoreTest } from "../__test/useFirestoreTest.hook.js";
import { firestoreProvider } from "./firestore-provider.js";

interface TimestampedItem extends TimestampedEntity {
  id: string;
  name: string;
}

describe("TimestampedRepository", () => {
  const collection = "timestamped-items";
  useFirestoreTest({ clearCollections: [collection] });
  let firestore: Firestore;
  let repository: TimestampedRepository<TimestampedItem>;
  let startTime: Date;

  beforeEach(async () => {
    firestore = firestoreProvider.get();
    repository = new TimestampedRepository<TimestampedItem>(collection, { firestore });
    vi.clearAllMocks();
    startTime = new Date();
  });

  const fixedTime = new Date("2022-03-01T12:13:14.000Z");

  const createItem = (id: string): TimestampedItem => ({
    ...newTimestampedEntity(id),
    name: `Test Item ${id}`,
  });

  const createItemFixedTime = (id: string): TimestampedItem => ({
    ...newTimestampedEntity(id),
    name: `Test Item ${id}`,
    createdAt: fixedTime,
    updatedAt: fixedTime,
  });

  const expectNewDate = (actual: Date) => {
    expect(actual >= startTime).toBeTruthy();
  };

  describe("insert", () => {
    it("adds createdAt and updatedAt if not set on existing", async () => {
      await repository.insert({
        id: "123",
        name: "Test Item 123",
      } as TimestampedItem);

      const inserted = await repository.getRequired("123");

      expect(inserted.createdAt).toEqual(inserted.updatedAt);
      expectNewDate(inserted.createdAt);
      expectNewDate(inserted.updatedAt);
    });

    it("adds createdAt and updatedAt if generate flag set", async () => {
      const item = createItem("123");

      await repository.insert(item);
      const inserted = await repository.getRequired("123");

      expect(inserted.createdAt).toEqual(inserted.updatedAt);
      expectNewDate(inserted.createdAt);
      expectNewDate(inserted.updatedAt);
    });
  });

  describe("save", () => {
    it("adds createdAt if not set (i.e. to an existing record)", async () => {
      await firestore.doc(`${collection}/123`).create({
        id: "123",
        name: "Test Item 123",
      });

      const fetched = await repository.getRequired("123");
      expect(fetched.createdAt).toBeFalsy();

      await repository.save(fetched);
      const updated = await repository.getRequired("123");
      expect(updated.createdAt).toEqual(updated.updatedAt);
      expectNewDate(updated.createdAt);
      expectNewDate(updated.updatedAt);
    });

    it("updates a single item", async () => {
      const item = createItemFixedTime("123");
      await firestore.doc(`${collection}/123`).create(item);

      await repository.save(item);

      const updated = await repository.getRequired("123");
      expect(updated.createdAt).toEqual(fixedTime);
      expectNewDate(updated.updatedAt);
    });

    it("updates array of items", async () => {
      const item1 = createItemFixedTime("123");
      const item2 = createItem("234");

      await repository.save([item1, item2]);

      const updated = await repository.getRequired(["123", "234"]);
      expect(updated[0].createdAt).toEqual(fixedTime);
      expectNewDate(updated[1].createdAt);
      expectNewDate(updated[0].updatedAt);
      expectNewDate(updated[1].updatedAt);
    });

    it("skips update if flag set", async () => {
      const item = createItemFixedTime("123");

      await runWithRequestStorage(async () => {
        setRequestStorageValue(DISABLE_TIMESTAMP_UPDATE, true);
        return repository.save(item);
      });

      const updated = await repository.getRequired("123");
      expect(updated.createdAt).toEqual(fixedTime);
      expect(updated.updatedAt).toEqual(fixedTime);
    });

    it("sets createdAt and updatedAt on new entity when flag set", async () => {
      await runWithRequestStorage(async () => {
        setRequestStorageValue(DISABLE_TIMESTAMP_UPDATE, true);
        return repository.save({
          ...newTimestampedEntity("123"),
          name: `Test Item 123`,
        });
      });

      const created = await repository.getRequired("123");
      expectNewDate(created.createdAt);
      expectNewDate(created.updatedAt);
    });
  });
});
