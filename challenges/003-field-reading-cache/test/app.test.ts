import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import { app } from '../src/app.js';

let baseUrl: string;
let server: ReturnType<typeof app.listen>;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('field readings API baseline', () => {
  it('lists configured fields', async () => {
    const response = await fetch(`${baseUrl}/api/fields`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      { id: 'field-north', name: 'North Acre', crop: 'barley' },
      { id: 'field-south', name: 'South Acre', crop: 'oats' },
    ]);
  });

  it('returns readings for a known field and 404 for an unknown field', async () => {
    const response = await fetch(`${baseUrl}/api/fields/field-north/readings`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      { id: 'r-100', fieldId: 'field-north', moisture: 31.4, recordedAt: '2025-04-10T08:00:00Z' },
      { id: 'r-101', fieldId: 'field-north', moisture: 29.8, recordedAt: '2025-04-10T12:00:00Z' },
    ]);
    assert.equal((await fetch(`${baseUrl}/api/fields/missing/readings`)).status, 404);
  });

  it('accepts a valid new reading and rejects invalid moisture', async () => {
    const created = await fetch(`${baseUrl}/api/fields/field-south/readings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moisture: 36.2, recordedAt: '2025-04-11T10:00:00Z' }),
    });
    assert.equal(created.status, 201);
    const reading = await created.json() as { id: string; moisture: number };
    assert.equal(reading.moisture, 36.2);
    assert.ok(reading.id);

    const invalid = await fetch(`${baseUrl}/api/fields/field-south/readings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moisture: 101, recordedAt: '2025-04-11T10:00:00Z' }),
    });
    assert.equal(invalid.status, 400);
  });
});
