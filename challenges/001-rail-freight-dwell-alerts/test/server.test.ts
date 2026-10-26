import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/server.js';

const app = createApp();
let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected TCP address');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => server.close());

test('health endpoint reports service status', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('consignments endpoint returns the fixture records when status is omitted', async () => {
  const response = await fetch(`${baseUrl}/consignments`);
  assert.equal(response.status, 200);
  const data = await response.json() as Array<{ id: string }>;
  assert.deepEqual(data.map(({ id }) => id), Array.from({ length: 28 }, (_, index) => `C-${index + 104}`));
});

test('consignments endpoint filters by exact status', async () => {
  const response = await fetch(`${baseUrl}/consignments?status=yard`);
  assert.equal(response.status, 200);
  const data = await response.json() as Array<{ id: string; status: string }>;
  assert.deepEqual(data.map(({ id }) => id), ['C-105', 'C-108', 'C-112', 'C-116', 'C-120', 'C-124', 'C-128']);
  assert.ok(data.every(({ status }) => status === 'yard'));
});

test('valid status without matching consignments returns an empty array', async () => {
  const response = await fetch(`${baseUrl}/consignments?status=scheduled`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('unsupported status returns a useful 400 error', async () => {
  const response = await fetch(`${baseUrl}/consignments?status=unknown`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Invalid status 'unknown'." });
});

test('empty status returns a 400 error', async () => {
  const response = await fetch(`${baseUrl}/consignments?status=`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'No status was provided.' });
});

test('status matching is case-sensitive', async () => {
  const response = await fetch(`${baseUrl}/consignments?status=Yard`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Invalid status 'Yard'." });
});

test('repeated status parameters are rejected', async () => {
  const response = await fetch(`${baseUrl}/consignments?status=yard&status=delayed`);
  assert.equal(response.status, 400);
});

test('unknown consignment returns not found', async () => {
  const response = await fetch(`${baseUrl}/consignments/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Consignment not found' });
});
