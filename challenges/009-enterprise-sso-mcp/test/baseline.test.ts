import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { createApp } from "../src/app.js";

let server: Server;
let origin: string;
before(async () => {
  server = createApp(async (token) => {
    if (token === "employee-token") return { sub: "user-employee", preferred_username: "alex.employee", realm_access: { roles: ["employee"] } };
    if (token === "manager-token") return { sub: "user-manager", preferred_username: "sam.manager", realm_access: { roles: ["employee", "project-manager"] } };
    throw new Error("invalid token");
  }).listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected TCP server");
  origin = `http://127.0.0.1:${address.port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

const request = (path: string, token?: string, init: RequestInit = {}) => fetch(`${origin}${path}`, {
  ...init,
  headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
});

test("health and project listing are available to authenticated employees", async () => {
  assert.deepEqual(await (await request("/health")).json(), { status: "ok" });
  const response = await request("/api/projects", "employee-token");
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).projects.map((project: { id: string }) => project.id), ["PRJ-101"]);
  const managerResponse = await request("/api/projects", "manager-token");
  assert.equal((await managerResponse.json()).projects.length, 2);
});

test("identity is derived from the authenticated principal", async () => {
  const response = await request("/api/me", "manager-token");
  assert.deepEqual(await response.json(), { username: "sam.manager", roles: ["employee", "project-manager"] });
});

test("missing and invalid credentials cannot access protected routes", async () => {
  assert.equal((await request("/api/projects")).status, 401);
  assert.equal((await request("/api/projects", "bogus")).status, 401);
});

test("only project managers can create projects", async () => {
  const body = JSON.stringify({ name: "New workspace" });
  assert.equal((await request("/api/projects", "employee-token", { method: "POST", body, headers: { "Content-Type": "application/json" } })).status, 403);
  assert.equal((await request("/api/projects", "manager-token", { method: "POST", body, headers: { "Content-Type": "application/json" } })).status, 201);
});
