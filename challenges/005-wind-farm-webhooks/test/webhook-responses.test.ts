import assert from "node:assert/strict";
import crypto from "node:crypto";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { app, turbines } from "../src/app.js";

const testSecret = "webhook-test-secret";
process.env.HMAC_SECRET = testSecret;

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

const post = (payload: unknown, signature: "valid" | "invalid" | "missing" = "valid") => {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signature === "valid") {
    headers["x-telemetry-signature"] = crypto.createHmac("sha256", testSecret).update(body).digest("hex");
  } else if (signature === "invalid") {
    headers["x-telemetry-signature"] = "0".repeat(64);
  }
  return fetch(`${baseUrl}/webhooks/telemetry`, { method: "POST", headers, body });
};

test("returns documented webhook statuses and messages", async () => {
  const baseEvent = {
    eventId: "test-event-1",
    turbineId: "T-1001",
    status: "fault",
    reportedAt: "2025-04-03T10:30:00Z",
    windSpeedMps: 8.1,
  };

  let response = await post(baseEvent, "missing");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { err: "Missing webhook signature" });

  response = await post(baseEvent, "invalid");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { err: "Invalid webhook signature" });

  response = await post({ eventId: "test-invalid-payload" });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { err: "Invalid webhook payload" });

  response = await post({ ...baseEvent, eventId: "test-unknown", turbineId: "T-9999" });
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Turbine not found" });

  const seededTurbine = turbines.find(({ id }) => id === "T-1002");
  assert.ok(seededTurbine);
  const seededState = { ...seededTurbine };
  response = await post({ ...baseEvent, eventId: "test-stale", turbineId: "T-1002", reportedAt: "2025-04-03T10:00:00Z" });
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { err: "Stale reading" });
  assert.deepEqual(seededTurbine, seededState);

  response = await post(baseEvent);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { msg: "Telemetry accepted" });

  response = await post({ ...baseEvent, status: "maintenance", reportedAt: "2025-04-03T10:35:00Z" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { msg: "Duplicate event acknowledged" });
  const updatedTurbine = turbines.find(({ id }) => id === "T-1001");
  assert.equal(updatedTurbine?.status, "fault");
  assert.equal(updatedTurbine?.reportedAt, baseEvent.reportedAt);

  const concurrentEvent = { ...baseEvent, eventId: "test-concurrent", turbineId: "T-1002", reportedAt: "2025-04-03T10:20:00Z" };
  const concurrentResponses = await Promise.all([post(concurrentEvent), post(concurrentEvent)]);
  assert.deepEqual(concurrentResponses.map(({ status }) => status), [200, 200]);
  const concurrentMessages = await Promise.all(concurrentResponses.map(async (item) => (await item.json() as { msg: string }).msg));
  assert.deepEqual(concurrentMessages.sort(), ["Duplicate event acknowledged", "Telemetry accepted"].sort());
});
