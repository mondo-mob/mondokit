import { Mock } from "@vitest/spy";
import { transactional } from "../__test/test-utils.js";
import { MutexService } from "./mutex.service.js";
import { Mutex, mutexesRepository } from "./mutexes.repository.js";
import { useFirestoreTest } from "../__test/useFirestoreTest.hook.js";

describe("MutexService", () => {
  useFirestoreTest({ clearCollections: ["mutexes"] });
  let mutexService: MutexService;

  beforeEach(async () => {
    mutexService = new MutexService({ expirySeconds: 5 });
  });

  describe("obtain", () => {
    it(
      "obtains mutex for new id",
      transactional(async () => {
        const mutex = await mutexService.obtain("test1", { expirySeconds: 10 });
        expect(mutex.id).toBe("test1");
        expect(mutex.locked).toBeTruthy();
        expect(secondsDifference(mutex.expiredAt, mutex.obtainedAt)).toBe(10);
      })
    );

    it(
      "obtains mutex for new id with default expiry seconds",
      transactional(async () => {
        const mutex = await mutexService.obtain("test1");
        expect(mutex.id).toBe("test1");
        expect(mutex.locked).toBeTruthy();
        expect(secondsDifference(mutex.expiredAt, mutex.obtainedAt)).toBe(5);
      })
    );

    it(
      "throws if mutex already active",
      transactional(async () => {
        await mutexService.obtain("test1");
        await expect(() => mutexService.obtain("test1")).rejects.toThrow(
          "Mutex test1 already active for another process"
        );
      })
    );

    it(
      "obtains mutex for previously released id",
      transactional(async () => {
        await mutexService.obtain("test1");
        await mutexService.release("test1");

        const mutex = await mutexService.obtain("test1");

        expect(mutex.id).toBe("test1");
        expect(mutex.locked).toBeTruthy();
      })
    );

    it(
      "obtains mutex for previously expired id",
      transactional(async () => {
        // Use negative timeout as quick way to automatically expire
        await mutexService.obtain("test1", { expirySeconds: -10 });

        const mutex = await mutexService.obtain("test1");

        expect(mutex.id).toBe("test1");
        expect(mutex.locked).toBeTruthy();
      })
    );

    it("cannot obtain mutex with id containing '/'", async () => {
      await expect(mutexService.obtain("foo/bar")).rejects.toThrow(
        "Mutex id elements cannot contain '/'. Supplied: foo/bar."
      );
    });

    it("cannot obtain mutex with id elements containing '/'", async () => {
      await expect(mutexService.obtain(["foo", "foo/bar"])).rejects.toThrow(
        "Mutex id elements cannot contain '/'. Supplied: foo,foo/bar."
      );
    });
  });

  describe("release", () => {
    it(
      "releases active mutex",
      transactional(async () => {
        const obtained = await mutexService.obtain("test1");
        expect(obtained.locked).toBeTruthy();

        const released = await mutexService.release("test1");
        expect(released).toBeTruthy();
        expect(released?.locked).toBeFalsy();
      })
    );

    it(
      "allows releasing non-existent mutex",
      transactional(async () => {
        const mutex = await mutexService.release("i-dont-exist");
        expect(mutex).toBe(null);
      })
    );
  });

  describe("withMutex", () => {
    let executorFunction: Mock;
    beforeEach(() => {
      executorFunction = vi.fn(() => "result");
    });

    it(
      "executes with mutex and releases after running",
      transactional(async () => {
        await expect(mutexService.withMutex("test1", executorFunction)).resolves.toBe("result");

        expect(executorFunction).toHaveBeenCalled();

        await expectMutex("test1", {
          locked: false,
        });
      })
    );

    it(
      "executes using string array for id",
      transactional(async () => {
        await expect(mutexService.withMutex(["test1", "test2"], executorFunction)).resolves.toBe("result");

        expect(executorFunction).toHaveBeenCalled();

        await expectMutex("test1::test2", {
          locked: false,
        });
      })
    );

    it(
      "throws when executor throws, and unlocks mutex",
      transactional(async () => {
        executorFunction = vi.fn(() => {
          throw new Error("Test error");
        });

        await expect(mutexService.withMutex("test1", executorFunction)).rejects.toThrow("Test error");

        expect(executorFunction).toHaveBeenCalled();

        await expectMutex("test1", {
          locked: false,
        });
      })
    );

    it(
      "throws if mutex already locked and does not call executor",
      transactional(async () => {
        await mutexService.obtain("test1");

        await expect(mutexService.withMutex("test1", executorFunction)).rejects.toThrow(
          "Mutex test1 already active for another process"
        );

        expect(executorFunction).not.toHaveBeenCalled();

        await expectMutex("test1", {
          locked: true,
        });
      })
    );
  });

  describe("withMutexSilent", () => {
    let executorFunction: Mock;
    beforeEach(() => {
      executorFunction = vi.fn(() => "result");
    });

    it(
      "executes with mutex and releases after running",
      transactional(async () => {
        await expect(mutexService.withMutexSilent("test1", executorFunction)).resolves.toBeUndefined();

        expect(executorFunction).toHaveBeenCalled();

        await expectMutex("test1", {
          locked: false,
        });
      })
    );

    it(
      "executes using string array for id",
      transactional(async () => {
        await expect(mutexService.withMutexSilent(["test1", "test2"], executorFunction)).resolves.toBeUndefined();

        expect(executorFunction).toHaveBeenCalled();

        await expectMutex("test1::test2", {
          locked: false,
        });
      })
    );

    it(
      "throws when executor throws, and unlocks mutex",
      transactional(async () => {
        executorFunction = vi.fn(() => {
          throw new Error("Test error");
        });

        await expect(mutexService.withMutexSilent("test1", executorFunction)).rejects.toThrow("Test error");

        expect(executorFunction).toHaveBeenCalled();

        await expectMutex("test1", {
          locked: false,
        });
      })
    );

    it(
      "does not throw error when mutex already lock and does not call executor function",
      transactional(async () => {
        await mutexService.obtain("test1");

        await expect(mutexService.withMutexSilent("test1", executorFunction)).resolves.toBeUndefined();

        expect(executorFunction).not.toHaveBeenCalled();

        await expectMutex("test1", {
          locked: true,
        });
      })
    );

    it(
      "calls supplied handler when mutex is locked",
      transactional(async () => {
        const handler = vi.fn();
        await mutexService.obtain("test1");

        await expect(
          mutexService.withMutexSilent("test1", executorFunction, { onMutexUnavailable: handler })
        ).resolves.toBeUndefined();

        expect(executorFunction).not.toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();

        await expectMutex("test1", {
          locked: true,
        });
      })
    );
  });

  describe("with prefixes", () => {
    beforeEach(() => {
      mutexService = new MutexService({
        expirySeconds: 5,
        prefix: ["grandparent", "parent"],
      });
    });

    describe("obtain", () => {
      it(
        "obtains mutex for new id",
        transactional(async () => {
          const mutex = await mutexService.obtain("test1", { expirySeconds: 10 });
          expect(mutex.id).toBe("grandparent::parent::test1");
          expect(mutex.locked).toBeTruthy();
          expect(secondsDifference(mutex.expiredAt, mutex.obtainedAt)).toBe(10);
        })
      );

      it(
        "obtains mutex for new id with multiple elements",
        transactional(async () => {
          const mutex = await mutexService.obtain(["test1", "test23"], { expirySeconds: 10 });
          expect(mutex.id).toBe("grandparent::parent::test1::test23");
          expect(mutex.locked).toBeTruthy();
          expect(secondsDifference(mutex.expiredAt, mutex.obtainedAt)).toBe(10);
        })
      );

      it(
        "obtains mutex for new id with default expiry seconds",
        transactional(async () => {
          const mutex = await mutexService.obtain("test1");
          expect(mutex.id).toBe("grandparent::parent::test1");
          expect(mutex.locked).toBeTruthy();
          expect(secondsDifference(mutex.expiredAt, mutex.obtainedAt)).toBe(5);
        })
      );
    });

    describe("release", () => {
      it(
        "releases active mutex",
        transactional(async () => {
          const obtained = await mutexService.obtain("test1");
          expect(obtained.locked).toBeTruthy();

          const released = await mutexService.release("test1");
          expect(released).toBeDefined();
          expect(released?.locked).toBeFalsy();
        })
      );

      it(
        "releases active mutex with multiple elements",
        transactional(async () => {
          const obtained = await mutexService.obtain(["test1", "test23"]);
          expect(obtained.locked).toBeTruthy();

          const released = await mutexService.release(["test1", "test23"]);
          expect(released).toBeDefined();
          expect(released?.locked).toBeFalsy();
        })
      );
    });

    describe("singlePrefix", () => {
      it(
        "obtains and releases",
        transactional(async () => {
          mutexService = new MutexService({
            expirySeconds: 5,
            prefix: "parent",
          });
          const obtained = await mutexService.obtain("test1");
          expect(obtained.locked).toBeTruthy();
          expect(obtained.id).toBe("parent::test1");

          const released = await mutexService.release("test1");
          expect(released).toBeDefined();
          expect(released?.locked).toBeFalsy();
        })
      );
    });
  });

  describe("validation", () => {
    it("cannot construct mutexService with prefix containing '/'", () => {
      expect(() => new MutexService({ expirySeconds: 1, prefix: "foo/bar" })).toThrow(
        "Mutex id elements cannot contain '/'. Supplied: foo/bar."
      );
    });

    it("cannot construct mutexService with prefix array containing '/'", () => {
      expect(() => new MutexService({ expirySeconds: 1, prefix: ["grandparent", "foo/bar"] })).toThrow(
        "Mutex id elements cannot contain '/'. Supplied: grandparent,foo/bar."
      );
    });
  });
});

const expectMutex = async (id: string, expectations: Partial<Mutex>) => {
  const mutex = await mutexesRepository.getRequired(id);
  expect(mutex).toMatchObject(expectations);
  return mutex;
};

const secondsDifference = (src: Date, orig: Date) => Math.floor((src.getTime() - orig.getTime()) / 1000);
