import express from "express";
import request from "supertest";
import { appEngineTask } from "./app-engine-task.js";

const initApp = () => {
  const app = express();
  app.use("/tasks", appEngineTask);
  app.get("/tasks/task1", (req, res) => res.json({ timeout: (req as any).socket.timeout }));
  return app;
};

describe("appEngineTask", () => {
  const app = initApp();

  it("allows request with x-appengine-taskname and sets timeout to 10 mins", async () => {
    await request(app).get("/tasks/task1").set("x-appengine-taskname", "poll-status").expect(200, { timeout: 600000 });
  });

  it("rejects request without x-appengine-taskname header", async () => {
    await request(app).get("/tasks/task1").expect(403);
  });
});
