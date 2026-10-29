import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import { app, turbines } from "../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("lists the synthetic turbine register", async () => {
  const response = await fetch(`${baseUrl}/turbines`);
  assert.equal(response.status, 200);
  const body = await response.json() as typeof turbines;
  assert.equal(body.length, 3);
  assert.equal(body[0].id, "T-1001");
});

test("returns one turbine or a not-found response", async () => {
  const found = await fetch(`${baseUrl}/turbines/T-1001`);
  assert.equal(found.status, 200);
  assert.equal((await found.json() as typeof turbines[number]).site, "North Ridge");

  const missing = await fetch(`${baseUrl}/turbines/T-9999`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: "Turbine not found" });
});
