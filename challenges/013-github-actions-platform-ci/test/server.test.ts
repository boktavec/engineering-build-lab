import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/server.js";
import type { Server } from "node:http";

let server: Server;
let base: string;
before(async () => {
  server = createApp();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("server did not bind");
  base = `http://127.0.0.1:${address.port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test("health endpoint reports success", async () => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("unknown routes return 404", async () => {
  const response = await fetch(`${base}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "not_found" });
});
