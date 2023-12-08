import { Datastore } from "@google-cloud/datastore";
import { runWithRequestStorage } from "@mondokit/gcp-core";
import { connectDatastoreEmulator, deleteKind, RepositoryItem } from "../__test/test-utils.js";
import { DatastoreLoader } from "./datastore-loader.js";
import { DatastoreRepository } from "./datastore-repository.js";
import { datastoreLoaderRequestStorage } from "./datastore-request-storage.js";
import { execPostCommitOrNow, isTransactionActive, PostCommitError, runInTransaction } from "./transactional.js";

describe("Transactional", () => {
  const collection1 = "transactional1";
  const collection2 = "transactional2";
  let datastore: Datastore;
  let repository1: DatastoreRepository<RepositoryItem>;
  let repository2: DatastoreRepository<RepositoryItem>;

  beforeAll(async () => (datastore = connectDatastoreEmulator()));
  beforeEach(async () => {
    await deleteKind(datastore, collection1);
    await deleteKind(datastore, collection2);
    repository1 = new DatastoreRepository<RepositoryItem>(collection1, { datastore });
    repository2 = new DatastoreRepository<RepositoryItem>(collection2, { datastore });
    vi.clearAllMocks();
  });

  const saveItems = async (id: string)  => {
    const item1 = await repository1.save({ id, name: `item${id}` });
    const item2 = await repository2.save({ id, name: `item${id}` });
    return [item1, item2];
  }

  describe("runInTransaction", () => {
    it("saves multiple collections in single transaction", async () => {
      const runTransactionSpy = vi.spyOn(datastore, "transaction");

      await runWithRequestStorage(async () => {
        datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));
        await runInTransaction(async () => {
          await saveItems("123");
        });
      });

      await expect(repository1.get("123")).resolves.toBeTruthy();
      await expect(repository2.get("123")).resolves.toBeTruthy();
      expect(runTransactionSpy).toBeCalledTimes(1);
    });

    it("returns result", async () => {
      const result = await runWithRequestStorage(async () => {
        datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));
        return runInTransaction(() => {
          return saveItems("123");
        });
      });

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ id: "123", name: "item123" });
    });

    it("continues existing transaction for nested decoration", async () => {
      const runTransactionSpy = vi.spyOn(datastore, "transaction");

      await runWithRequestStorage(async () => {
        datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));
        await runInTransaction(async () => {
          await runInTransaction(async () => {
            await saveItems("123");
          });
        });
      });

      await expect(repository1.get("123")).resolves.toBeTruthy();
      await expect(repository2.get("123")).resolves.toBeTruthy();
      expect(runTransactionSpy).toBeCalledTimes(1);
    });

    it("should abort when error thrown", async () => {
      await runWithRequestStorage(async () => {
        datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));

        try {
          await runInTransaction(async () => saveItems("234"));
          await runInTransaction(async () => {
            await saveItems("567");
            throw new Error("failed");
          });
          expect("Expected an error. Should have thrown by now").toBe("pass");
        } catch {
          await expect(repository1.get("234")).resolves.toBeTruthy();
          await expect(repository2.get("234")).resolves.toBeTruthy();
          await expect(repository1.get("567")).resolves.toBe(null);
          await expect(repository2.get("567")).resolves.toBe(null);
        }
      });
    });
  });

  describe("isTransactionActive", () => {
    it("returns true if transaction active", async () => {
      await runWithRequestStorage(async () => {
        datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));
        await runInTransaction(async () => expect(isTransactionActive()).toBe(true));
      });
    });

    it("returns false if transaction not active", async () => {
      await runWithRequestStorage(async () => {
        datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));
        expect(isTransactionActive()).toBe(false);
      });
    });

    it("returns false if no datastore loader request storage set", async () => {
      expect(isTransactionActive()).toBe(false);
    });
  });

  describe("execPostCommitOrNow", () => {
    it("executes action after commit, when in transaction", async () => {
      const executions: string[] = [];

      await testTransactionalSupport(() =>
        runInTransaction(async () => {
          await execPostCommitOrNow(() => executions.push("post-commit-1"));
          executions.push("action-1");
          await execPostCommitOrNow(() => executions.push("post-commit-2"));
          executions.push("action-2");
          executions.push("action-3");
        })
      );

      expect(executions).toEqual(["action-1", "action-2", "action-3", "post-commit-1", "post-commit-2"]);
    });

    it("does not execute post-commit actions when transaction does not commit", async () => {
      const executions: string[] = [];

      await expect(() =>
        testTransactionalSupport(() =>
          runInTransaction(async () => {
            await execPostCommitOrNow(() => executions.push("post-commit-1"));
            executions.push("action-1");
            await execPostCommitOrNow(() => executions.push("post-commit-2"));
            executions.push("action-2");
            throw new Error("Something went wrong");
          })
        )
      ).rejects.toThrow("Something went wrong");

      expect(executions).toEqual(["action-1", "action-2"]);
    });

    it("executes immediately when there is no open transaction", async () => {
      const executions: string[] = [];

      await testTransactionalSupport(async () => {
        await execPostCommitOrNow(() => executions.push("post-commit-1"));
        executions.push("action-1");
        await execPostCommitOrNow(() => executions.push("post-commit-2"));
        executions.push("action-2");
        executions.push("action-3");
      });

      expect(executions).toEqual(["post-commit-1", "action-1", "post-commit-2", "action-2", "action-3"]);
    });

    it("throws PostCommitError with result and cause when post commit action fails", async () => {
      const executions: string[] = [];
      const theCause = new Error("I am the cause");

      try {
        await testTransactionalSupport(() =>
          runInTransaction(async () => {
            await execPostCommitOrNow(() => executions.push("post-commit-0"));
            await execPostCommitOrNow(() => {
              throw theCause;
            });
            executions.push("action-1");
            await execPostCommitOrNow(() => executions.push("post-commit-2"));
            executions.push("action-2");
            executions.push("action-3");
            return "Result of the transactional block";
          })
        );
        expect("Expected an error. Test failed.").toBe("pass");
      } catch (err) {
        expect(err).toBeInstanceOf(PostCommitError);
        const postCommitError = err as PostCommitError;
        expect(postCommitError.cause).toBe(theCause);
        expect(postCommitError.result).toBe("Result of the transactional block");
      }

      expect(executions).toEqual(["action-1", "action-2", "action-3", "post-commit-0"]);
    });
  });

  const testTransactionalSupport = <T>(testFn: () => Promise<T>): Promise<T> =>
    runWithRequestStorage(async () => {
      datastoreLoaderRequestStorage.set(new DatastoreLoader(datastore));
      return testFn();
    });
});

