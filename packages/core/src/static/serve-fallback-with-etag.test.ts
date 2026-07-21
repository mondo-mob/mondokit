import fs from "fs";
import os from "os";
import path from "path";
import express from "express";
import request from "supertest";
import { generateHash } from "./utils.js";
import { serveFallbackWithEtag } from "./serve-fallback-with-etag.js";

const initApp = (fallback = "src/static/index.ts") => {
  const app = express();
  app.get("/notfallback", (req, res, next) => {
    // contrived example to marked headersSent flag to true
    res.writeHead(200, { "Content-Type": "text/plain" });
    next();
  });
  app.use(serveFallbackWithEtag(fallback));
  app.get("/notfallback", (req, res) => {
    res.write("NOT FALLBACK");
    res.end();
  });
  // Guard against the middleware calling next() after a successful send.
  app.use((req, res) => {
    res.write("Shouldn't get here");
    res.end();
  });
  return app;
};

describe("serveFallbackWithEtag", () => {
  it("returns fallback file with etag", async () => {
    const app = initApp();
    const expectedHash = await generateHash("src/static/index.ts");
    await request(app).get("/unspecified_path").expect(200).expect("etag", `"${expectedHash}"`);
  });

  it("serves a fallback file under a hidden directory in the absolute path", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mondokit-fallback-"));
    const hiddenDir = path.join(root, ".cache");
    fs.mkdirSync(hiddenDir);
    const filePath = path.join(hiddenDir, "index.html");
    fs.writeFileSync(filePath, "fallback-ok");

    try {
      const app = initApp(filePath);
      const expectedHash = await generateHash(filePath);
      await request(app).get("/unspecified_path").expect(200, "fallback-ok").expect("etag", `"${expectedHash}"`);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("returns fallback file without last-modified header", async () => {
    const app = initApp();
    await request(app)
      .get("/unspecified_path")
      .expect(200)
      .expect((res) => expect(res.headers["last-modified"]).toBeUndefined());
  });

  it("does not interfere when headers already sent", async () => {
    const app = initApp();
    await request(app).get("/notfallback").expect(200).expect("NOT FALLBACK");
  });

  it("ignores missing fallback file", async () => {
    const app = initApp("not-a-file");

    await request(app).get("/notfallback").expect(200).expect("NOT FALLBACK");
  });
});
