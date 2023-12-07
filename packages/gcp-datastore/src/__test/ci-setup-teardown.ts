/* eslint-disable @typescript-eslint/ban-ts-comment */
import DataStoreEmulator from "google-datastore-emulator";


export async function setup() {
  const emulator = new DataStoreEmulator({
    port: 8081,
    project: "datastore-tests",
    storeOnDisk: false,
  });
  console.log("Starting datastore emulator...");
  try {
    const start = Date.now();
    await emulator.start();
    console.log(`Datastore emulator started in ${Date.now() - start}ms`);
    // @ts-ignore
    global.__DATASTORE__ = emulator;
  } catch (e) {
    console.error("Error starting emulator", e);
    return emulator.stop();
  }
}

export async function teardown(){
  // @ts-ignore
  const emulator = global.__DATASTORE__;
  if (emulator) {
    console.log("Stopping datastore emulator");
    return emulator.stop();
  } else {
    console.log("No emulator found");
  }
}
