import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import { app, Cache, type Reading } from '../src/app.js';

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

    const beforeInvalid = await fetch(`${baseUrl}/api/fields/field-south/readings`);
    for (const body of [
      { moisture: 101, recordedAt: '2025-04-11T10:00:00Z' },
      { moisture: 27.5, recordedAt: 'not-a-date' },
    ]) {
      const invalid = await fetch(`${baseUrl}/api/fields/field-south/readings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      assert.equal(invalid.status, 400);
    }
    assert.equal((await fetch(`${baseUrl}/api/fields/missing/readings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moisture: 27.5, recordedAt: '2025-04-11T10:00:00Z' }),
    })).status, 404);
    const afterInvalid = await fetch(`${baseUrl}/api/fields/field-south/readings`);
    assert.deepEqual(await afterInvalid.json(), await beforeInvalid.json());
  });

  it('keeps fields isolated and reloads current readings after cache expiry', async () => {
    const getReadings = async (fieldId: string) => {
      const response = await fetch(`${baseUrl}/api/fields/${fieldId}/readings`);
      assert.equal(response.status, 200);
      return await response.json() as Array<{ id: string; fieldId: string }>;
    };

    const northFirst = await getReadings('field-north');
    assert.deepEqual(await getReadings('field-north'), northFirst);
    const southBefore = await getReadings('field-south');
    assert.ok(northFirst.every((reading) => reading.fieldId === 'field-north'));
    assert.ok(southBefore.every((reading) => reading.fieldId === 'field-south'));

    const created = await fetch(`${baseUrl}/api/fields/field-north/readings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moisture: 27.6, recordedAt: '2025-04-11T10:00:00Z' }),
    });
    assert.equal(created.status, 201);
    const newReading = await created.json() as { id: string };
    const northAfterPost = await getReadings('field-north');
    assert.ok(northAfterPost.some((reading) => reading.id === newReading.id));
    assert.ok(northAfterPost.every((reading) => reading.fieldId === 'field-north'));
    assert.ok(southBefore.every((reading) => !northAfterPost.some((north) => north.id === reading.id)));
  });

  it('reloads the full source list when any cached reading expires', () => {
    const northOne: Reading = { id: 'n-1', fieldId: 'field-north', moisture: 31, recordedAt: '2025-04-10T08:00:00Z' };
    const northTwo: Reading = { id: 'n-2', fieldId: 'field-north', moisture: 29, recordedAt: '2025-04-10T12:00:00Z' };
    const southOne: Reading = { id: 's-1', fieldId: 'field-south', moisture: 34, recordedAt: '2025-04-10T09:30:00Z' };
    const source = [northOne, northTwo, southOne];
    const originalNow = Date.now;
    const start = originalNow();
    const cache = new Cache(source, 5);

    try {
      Date.now = () => start + 240_000;
      const newReading: Reading = { id: 'n-3', fieldId: 'field-north', moisture: 28, recordedAt: '2025-04-11T10:00:00Z' };
      source.push(newReading);
      cache.add(newReading, Math.floor(Date.now() / 1000));

      Date.now = () => start + 301_000;
      assert.deepEqual(cache.get('field-north'), [northOne, northTwo, newReading]);
      assert.deepEqual(cache.get('field-south'), [southOne]);
    } finally {
      Date.now = originalNow;
    }
  });
});
