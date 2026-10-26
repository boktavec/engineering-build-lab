# Challenge 002 — Bookshop Stock Holds

**Level:** 2 — Integration
**Industry:** Independent book retail
**Stack:** Python 3.11+, FastAPI, pytest, SQLite (stdlib)

## Business context

A neighborhood bookseller exposes its catalogue to customers and nearby schools through a small service. Staff need a reliable way to temporarily hold copies while customers arrange pickup, without promising the same copy to multiple people. The current service is read-only, so the shop cannot yet track those commitments.

## What already works

The FastAPI service lists synthetic books and retrieves a book by ISBN. The fixture includes titles, authors, and available-copy counts; no database or external service is required for the baseline.

## Your assignment

As a bookseller, I want to place a temporary hold on available copies of a book so that pickup requests are recorded and inventory is not oversold.

## Acceptance criteria

- `POST /holds` accepts a valid ISBN and positive quantity, records a hold, and reduces the reported available copies.
- A request for an unknown ISBN returns `404`; invalid or non-positive quantities return `422`.
- A request exceeding available copies returns `409` and does not change inventory.
- Existing catalogue list and detail behavior remains available, with accurate copy counts after holds.

## Constraints

- Use only the synthetic catalogue data; no paid service or external account is needed.
- Holds and inventory changes must persist across application restarts using local SQLite.
- Preserve the existing book response fields and successful catalogue response shapes.

## Out of scope

Hold expiration, customer accounts, cancellation, payment, administrative UI, migrations framework, and deployment infrastructure.

## Run & verify

Requires Python 3.11 or newer.

```bash
cd challenges/002-bookshop-stock-holds
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
uvicorn src.main:app --reload
```

Try the working baseline in another terminal:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok"}

curl http://127.0.0.1:8000/books/BK-1001
# {"isbn":"BK-1001","title":"The Glass Orchard","author":"Mira Sol","available_copies":4}

curl http://127.0.0.1:8000/books
# Returns the synthetic catalogue as a JSON array.
```

The SQLite database path can be set with `DATABASE_PATH` when you implement the feature; the baseline does not create or use it.

## Optional stretch goal

Add a hold lookup endpoint that returns the recorded hold by its identifier.
