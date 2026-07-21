/* eslint-disable @typescript-eslint/ban-ts-comment */
import { spawn } from "node:child_process";
import kill from "tree-kill";

export async function setup() {
  try {
    console.log("Starting datastore emulator...");
    const start = Date.now();

    // @ts-ignore
    global.__DATASTORE__ = spawn(
      "gcloud",
      [
        "beta",
        "emulators",
        "datastore",
        "start",
        "--host-port=localhost:8081",
        "--project=datastore-tests",
        "--no-store-on-disk",
        "--use-firestore-in-datastore-mode",
      ],
      {
        stdio: "inherit",
        shell: true,
      },
    );

    let started = false;
    while (Date.now() - start < 10000) {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Checking emulator startup...");
      try {
        const res = await fetch("http://localhost:8081/");
        if (res.ok) {
          started = true;
          break;
        } else {
          console.log("Not ready yet...", await res.text());
        }
      } catch {
        console.log("Not ready yet...");
      }
    }

    if (started) {
      console.log(`Datastore emulator started in ${Date.now() - start}ms`);
    } else {
      console.log(`Emulator did not start within ${Date.now() - start}ms`);
    }
  } catch (e) {
    console.error("Error starting emulator", e);
  }
}

export async function teardown() {
  // @ts-ignore
  const emulator = global.__DATASTORE__;
  if (emulator) {
    console.error("Stopping datastore emulator");
    kill(emulator.pid, "SIGKILL");
  } else {
    console.log("No emulator found");
  }
}
