# Engineering Build Lab — Challenge Log

Use this log to select varied, gradually harder challenges. Record **observed progress**, not assumed completion. Do not add or update a completion/assessment entry until the learner asks for a review/log update. Do not reconstruct missing historical details; use `Not Observed` or `Unknown`.

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

### Challenge 003 — Field Reading Cache
- **Level / industry / stack:** Level 3 / agriculture / TypeScript, Node.js, Express 5, `node:test`.
- **Feature and skills practiced:** Per-field process-local TTL cache, refresh from the in-memory source of truth, write-through behavior for successful POSTs, error-path preservation, and real-route/cache testing.
- **Verification:** `npm test` — 5 passed; `npm run typecheck` — passed. Route tests use the real Express app; expiry refresh uses a separate real `Cache` instance with a simulated clock. The tested expiry path refreshes the full current field list when a cached item expires.
- **What went well:** The learner corrected an initial one-reading-per-field assumption, used actual outputs to challenge mismatched runs, identified the reversed expiry comparison, and articulated why refreshed entries should share a TTL boundary and why the source list must be separate from the cache.
- **Gaps / next practice target:** Final cache refresh logic and test updates were AI-authored at the learner's request. Explain and implement a small cache-refresh variant independently; consider an isolated app factory if route-level expiry needs end-to-end testing.
- **Suggested next level:** Continue at Level 3 or progress modestly, varying domain and focus; reinforce testing design and state boundaries.
- **Challenge type / skills:** Cross-cutting API cache; TTL semantics, source-of-truth separation, test isolation, HTTP integration.
- **Completion status:** Complete.
- **Assessment scores:** Problem Understanding (15%): 3; Problem-Solving and Reasoning (15%): 4; Implementation and Correctness (20%): 3; Testing and Verification (15%): 3; Engineering Judgment (15%): 3; Technical Understanding (10%): 3; AI Effectiveness and Ownership (10%): 4. Weighted reflection aid: 3.25/5; all categories observed, not an objective measure.
- **Demonstrated strengths:** Persistent evidence-seeking; correction of AI scope and test-instance mismatch; high-level reasoning about process-local state and source data.
- **Knowledge gaps:** Independent implementation of the final refresh path and feature tests was not demonstrated; persistent/shared state design was discussed only at a high level.
- **AI assistance patterns:** AI explained TypeScript/JavaScript and TTL concepts, ran scenarios, authored the final refresh fix and tests, and drafted the retrospective. Learner checked outputs, corrected scope, and reviewed results.
- **Key lessons:** Expired cached snapshots should be rebuilt from current source data; refreshing the full list aligns its TTL; cache state is not durable source data; fake time can leak effects through shared singleton state.
- **Follow-up topics:** Cache-aside vs write-through semantics; durable source of truth and multi-process cache coherence; independent test design for expiry.


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
- **Challenge type / skills:**
- **Completion status:** Complete / Partial / Blocked / Abandoned
- **Assessment scores:** Problem Understanding (15%): ; Problem-Solving and Reasoning (15%): ; Implementation and Correctness (20%): ; Testing and Verification (15%): ; Engineering Judgment (15%): ; Technical Understanding (10%): ; AI Effectiveness and Ownership (10%):
- **Demonstrated strengths:**
- **Knowledge gaps:**
- **AI assistance patterns:**
- **Key lessons:**
- **Follow-up topics:**
```

## Topic coverage to rotate through

- [x] TypeScript / Node.js APIs
- [x] Python services
- [x] Middleware / auth / validation
- [x] Relational data / migrations
- [x] Caching / async work / queues
- [x] Testing / mocking / integration tests
- [ ] External APIs / webhooks
- [ ] AI integration / LangGraph
- [ ] Docker / Kubernetes
- [ ] Terraform / IaC
- [ ] CI/CD / observability / reliability
- [x] Security / data integrity

The checklist tracks coverage, not mandatory ordering. Mark a topic only when truly practiced.
