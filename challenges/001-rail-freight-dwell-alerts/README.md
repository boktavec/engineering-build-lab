# Challenge 001 — Rail Yard Consignment Search

**Level:** 1 — Foundations
**Industry:** Rail freight logistics
**Stack:** TypeScript, Express 5, Node test runner

## Business context

A regional rail operator uses a small yard-management service to track freight consignments as they move between terminals. Dispatchers currently retrieve the full list and manually scan for the shipments that need attention. A simple status filter will help them focus on the work relevant to their shift without changing how shipment records are stored.

## What already works

The Express service exposes a health check, returns all synthetic consignment records, and retrieves one record by ID. The fixture includes several operational statuses and terminal locations.

## Your assignment

As a dispatcher, I want to request consignments filtered by their operational status so that I can quickly find the shipments relevant to my work.

## Acceptance criteria

- `GET /consignments?status=<status>` returns only consignments whose status exactly matches the requested status.
- Requests without a `status` query parameter continue returning the full list.
- A valid status with no matching consignments returns `200` and an empty JSON array.
- An unsupported or empty status returns `400` with a useful JSON error response.
- Existing health, list, and detail behavior remains unchanged.

## Constraints

- Keep the existing response shape for successful list requests: a JSON array of consignment objects.
- Use only the included synthetic fixture data; do not add a database or external service.
- Status matching is exact and case-sensitive.

## Out of scope

Pagination, multi-status filtering, free-text search, sorting, authentication, persistence, and editing consignments.

## Run & verify

Requires Node.js 20 or newer.

```bash
cd challenges/001-rail-freight-dwell-alerts
npm install
npm test
npm start
```

In another terminal, try the working baseline:

```bash
curl http://localhost:3000/health
# {"status":"ok"}

curl http://localhost:3000/consignments/C-104
# {"id":"C-104","origin":"Port Alder","destination":"Redstone Junction","status":"in_transit","cars":18}

curl http://localhost:3000/consignments
# Returns all 28 fixture records as a JSON array.
```

`PORT` can be set to choose another listening port.

## Optional stretch goal

Add a `destination` filter that can be combined with `status`, while retaining the existing behavior when neither filter is present.
