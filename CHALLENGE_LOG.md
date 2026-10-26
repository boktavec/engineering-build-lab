# Engineering Build Lab — Challenge Log

Use this log to select varied, gradually harder challenges. Record **observed progress**, not assumed completion. Do not add a completed entry until the learner asks for a review/log update.

## Progress

### Challenge 001 — Rail Yard Consignment Search
- **Level / industry / stack:** Level 1 / rail freight logistics / TypeScript, Express 5, Node.js `node:test`.
- **Feature and skills practiced:** Status query filtering on the existing list route; status validation, Express query typing, and direct plus HTTP integration tests. The allowed statuses are a fixed set so a valid status with no fixture matches can be tested.
- **Verification:** `npm test` — 23 passed; `npx tsc --noEmit` — passed. Tests exercise the real Express routes and the validator directly.
- **What went well:** Covered omitted, valid, missing, unsupported, case-sensitive, repeated, and valid-but-unmatched status inputs; updated the fixture-list assertion after expanding the synthetic data.
- **Gaps / next practice target:** Feature tests were authored with AI assistance; continue practicing deriving and implementing behavioral tests independently.
- **Suggested next level:** Level 2, in a different domain and with a modest integration or persistence concept.

### Challenge 002 — Bookshop Stock Holds
- **Level / industry / stack:** Level 2 / independent book retail / Python, FastAPI, Pydantic, SQLite, pytest.
- **Feature and skills practiced:** Stock holds, strict request validation, persistent SQLite state seeded idempotently from JSON, preserving catalogue response shapes, and real-route tests with temporary databases.
- **Verification:** `pytest -q` — 17 passed (5 dependency deprecation warnings). Tests cover valid/repeated holds, 404/409/422 outcomes, booleans, non-positive and non-integer quantities with no inventory changes, fixture seeding, restart persistence, and simultaneous requests; the concurrency test verifies one 200 and one 409 for competing holds that exceed stock together. A separate temporary-app restart check confirmed state persists across Uvicorn restarts.
- **What went well:** You debugged from actual HTTP outcomes, preserved the catalogue contract, moved fixture seeding to the database module, and addressed race safety with a conditional update. The test suite exercises real routes and SQLite; a synchronization barrier forces both competing requests to read the same initial stock before the updates.
- **Gaps / next practice target:** No blocking acceptance gaps remain. The database helper and most initial tests were AI-authored at your request; the final boolean and concurrency regression coverage was also AI-assisted, so these are not recorded as independent test implementation. Continue reviewing generated changes and verifying them against the contract.
- **Suggested next level:** Level 3, in a different domain, with a scoped cross-cutting concern such as caching, asynchronous processing, or a migration.


## Entry format

When the learner confirms completion, append a short entry with:

```markdown
### Challenge NNN — <title>
- **Level / industry / stack:**
- **Feature and skills practiced:**
- **Verification:** Commands/tests actually run and their outcomes.
- **What went well:**
- **Gaps / next practice target:**
- **Suggested next level:**
```

## Topic coverage to rotate through

- [x] TypeScript / Node.js APIs
- [x] Python services
- [x] Middleware / auth / validation
- [x] Relational data / migrations
- [ ] Caching / async work / queues
- [x] Testing / mocking / integration tests
- [ ] External APIs / webhooks
- [ ] AI integration / LangGraph
- [ ] Docker / Kubernetes
- [ ] Terraform / IaC
- [ ] CI/CD / observability / reliability
- [x] Security / data integrity

The checklist tracks coverage, not mandatory ordering. Mark a topic only when truly practiced.
