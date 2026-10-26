import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateStatus } from '../src/server.js';

for (const status of [undefined, null, ''] as const) {
  test(`missing status ${String(status)} returns an error`, () => {
    assert.deepEqual(validateStatus(status), { err: 'No status was provided.' });
  });
}

for (const status of ['scheduled', 'loading', 'in_transit', 'yard', 'delayed', 'delivered', 'cancelled']) {
  test(`valid status ${status} passes validation`, () => {
    assert.equal(validateStatus(status), undefined);
  });
}

for (const status of ['unknown', 'Yard', ' ']) {
  test(`unsupported status ${JSON.stringify(status)} returns an error`, () => {
    assert.deepEqual(validateStatus(status), { err: `Invalid status '${status}'.` });
  });
}

test('repeated status query values are rejected', () => {
  assert.deepEqual(validateStatus(['yard', 'delayed']), { err: "Invalid status 'yard,delayed'." });
});
