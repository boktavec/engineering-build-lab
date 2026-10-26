# Challenge 002 Retrospective — Bookshop Stock Holds

## Outcome

The completed service seeds SQLite from the JSON catalogue, preserves the catalogue response shape, and records persistent stock holds through `POST /holds`. The request model strictly rejects booleans as quantities; a conditional update prevents competing requests from overselling inventory.

**Verification:** `pytest -q` — **17 passed** (five dependency deprecation warnings). Coverage includes catalogue behavior, JSON fixture seeding and idempotency, valid and repeated holds, unknown ISBNs, invalid and non-positive quantities (including `true`, `false`, and a float), rejection without inventory changes, insufficient stock with no inventory change, persistence after database reinitialization, and concurrent holds. The concurrency test submits two real route requests for 3 copies against 4 available; a barrier after each real book lookup ensures both observe the same initial stock. Exactly one request succeeds, the other receives 409, and the final inventory is 1 available / 3 on hold. A separate temporary-app check confirmed the hold survives a Uvicorn restart.

**Review status: complete.** The earlier overselling, boolean-quantity, and missing-book lookup findings are addressed. The database helper and initial test suite were written with AI assistance at your request; the final regression coverage was also AI-assisted. Those uses—asking questions, cleaning up code/repository structure, and testing changes—are appropriate and are not described as excessive AI use or vibe coding.

## How problem solving went

You iterated from observed HTTP behavior, adjusted the endpoint and SQLite queries, and checked persistence across initialization and restart. You chose to preserve the existing catalogue contract and requested tests through real routes with temporary SQLite databases rather than mocked storage. Review findings led to an atomic stock update and strict request validation; the new tests now protect those cases.

AI explained concepts, performed checks, and authored the database-helper refactor and much of the test suite. The hold route was iteratively written and adjusted by you. Credit generated code accurately; the testing and cleanup assistance are useful parts of the collaboration, not evidence of overuse.

## What to practice next

- Continue designing regression tests from failure modes, especially when state can change concurrently.
- In future persistence work, consider how schema changes are deployed and how SQLite locking behaves under larger write loads.
- Move to a Level 3 challenge in a different domain, with one scoped cross-cutting concern.

This exercise demonstrates careful debugging and attention to API contracts, but does not establish a production-impact STAR interview example. No interview-prep STAR entry was added.
