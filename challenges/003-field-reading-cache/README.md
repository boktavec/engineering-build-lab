# Challenge 003 — Field Reading Cache

**Level:** 3 — Cross-cutting
**Industry:** Agriculture
**Stack:** TypeScript, Node.js, Express 5, `node:test`

## Business context

A small farm cooperative collects soil-moisture readings from sensors in its crop fields. Agronomists repeatedly check field readings while deciding where to inspect or irrigate, and the service is expected to serve those reads efficiently as usage grows. Reading submissions must still be reflected promptly in subsequent results.

## What already works

The standalone service lists two synthetic fields, returns readings for a field, accepts a new reading, and reports unknown fields or invalid input. Data is held in memory and resets when the process restarts.

## Your assignment

As a cooperative agronomist, I want repeated field-reading requests to be served from a short-lived cache, while newly submitted readings become visible immediately.

## Acceptance criteria

- Repeated successful reading requests for the same field reuse a cached result for a configurable short TTL.
- Requests for different fields do not share cached results.
- A successful reading submission makes the next reading request for that field include the new reading.
- Unknown fields and invalid reading submissions continue to return their existing error responses and do not create misleading cached results.
- After the TTL expires, a reading request reflects the current underlying data rather than a stale cached response.

## Constraints

- Preserve the existing HTTP paths and successful response shapes.
- Keep the starter local and runnable without external services, credentials, or network access.
- The cache is process-local; no persistence is required for readings or cached results.
- Choose a sensible short default TTL and make the TTL configurable for tests or local runs.

## Out of scope

Distributed caching, cache metrics/dashboard, database persistence, sensor authentication, date-range filtering, deployment, and changes to the business validation rules.

## Run & verify

Requires Node.js 20 or newer.

```bash
cd challenges/003-field-reading-cache
npm install
npm test
npm run typecheck
npm start
```

The service listens on port 3000 by default; set `PORT` to use another port.

Try the working baseline in another terminal:

```bash
curl http://localhost:3000/health
# {"status":"ok"}

curl http://localhost:3000/api/fields/field-north/readings
# [{"id":"r-100","fieldId":"field-north","moisture":31.4,"recordedAt":"2025-04-10T08:00:00Z"}, ...]

curl -X POST http://localhost:3000/api/fields/field-north/readings \
  -H 'content-type: application/json' \
  -d '{"moisture":27.5,"recordedAt":"2025-04-11T10:00:00Z"}'
# 201 Created with the new reading
```

## Optional stretch goal

Add a lightweight way to observe cache hits and misses without changing the reading response shape.
