# Challenge 005 — Wind Farm Telemetry Webhooks

**Level 4 · Renewable energy · TypeScript, Node.js, Express 5, `node:test` · Webhook integration**

## Business context

A small wind-farm operator receives equipment status updates from a third-party turbine monitoring service. Operators currently inspect a local status board, but delayed or forged updates could hide a turbine fault. The service needs to accept provider notifications safely while keeping its existing read-only status view stable.

## What already works

The baseline API serves a synthetic register of turbines and their latest known readings. List and detail requests work locally and are covered by passing baseline tests. No external service or credentials are needed.

## Your assignment

As an operations engineer, I want the service to receive authenticated monitoring-provider webhooks and update the affected turbine status so operators can see current equipment conditions.

## Acceptance criteria

- `POST /webhooks/telemetry` accepts a correctly signed, valid event and updates the matching turbine's reported status and reading time; subsequent list/detail responses show the update.
- Invalid or missing signatures are rejected without changing any turbine data.
- Re-delivery of an already accepted event does not apply its update twice and returns a documented successful response, including when duplicate deliveries arrive concurrently.
- A correctly signed event for an unknown turbine or with an invalid payload is rejected without changing any turbine data.
- A valid but older reading cannot overwrite a newer reading for the same turbine; document the response behavior for this stale event.
- Existing list and detail routes retain their response shape and continue to work.

## Webhook response behavior

| Outcome | HTTP status | Response body |
|---|---:|---|
| Accepted event | 200 | `{"msg":"Telemetry accepted"}` |
| Duplicate event | 200 | `{"msg":"Duplicate event acknowledged"}` |
| Missing signature | 401 | `{"err":"Missing webhook signature"}` |
| Invalid signature | 401 | `{"err":"Invalid webhook signature"}` |
| Invalid payload | 400 | `{"err":"Invalid webhook payload"}` |
| Unknown turbine | 404 | `{"error":"Turbine not found"}` |
| Stale reading | 409 | `{"err":"Stale reading"}` |

## Constraints

- Use only synthetic data and a local signing secret; do not call a real provider.
- The provider signature is an HMAC-SHA256 hex digest of the exact raw HTTP request body, supplied in the `x-telemetry-signature` header. Compare signatures safely; do not trust a parsed/re-serialized body for verification.
- Event IDs identify provider deliveries. Keep the implementation process-local; durable storage and multi-instance coordination are not required.
- For readings on one turbine, `reportedAt` determines freshness. Do not replace newer state with older telemetry.
- Use the existing API stack and keep changes focused. Choose and document the webhook response codes and duplicate/stale-delivery response behavior.

## Out of scope

Provider account setup, durable databases, asynchronous queues, retries to the provider, authentication for the read-only endpoints, alerting, dashboards, and deployment are not required.

## Run & verify

Requires Node.js 20 or newer.

```bash
cd challenges/005-wind-farm-webhooks
npm install
npm test
npm run typecheck
npm start
```

The server listens on `http://127.0.0.1:3000`.

Try the existing baseline in another terminal:

```bash
curl http://127.0.0.1:3000/turbines
curl http://127.0.0.1:3000/turbines/T-1001
```

The list returns a JSON array; a detail response resembles:

```json
{"id":"T-1001","site":"North Ridge","status":"operational","reportedAt":"2025-04-03T10:15:00Z","windSpeedMps":8.4}
```

The feature request uses a request body shaped like:

```json
{"eventId":"evt-2001","turbineId":"T-1001","status":"fault","reportedAt":"2025-04-03T10:30:00Z","windSpeedMps":8.1}
```

## Optional stretch goal

Add a small, deterministic test proving that a signature for one body cannot be reused for a different body.
