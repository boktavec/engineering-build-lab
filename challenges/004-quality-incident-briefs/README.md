# Challenge 004 — Quality Incident Briefs

**Level 3 · Food manufacturing · Python, FastAPI, pytest · AI integration**

## Business context

A small food manufacturer records quality incidents raised during production, such as packaging defects and temperature excursions. Shift leads need a quick, readable overview before deciding which records to investigate, but the notes are written by different operators and vary in detail. A generated brief could help them scan the facts faster, provided it does not invent details or replace human judgment.

## What already works

The service exposes a synthetic incident register: list all incidents or retrieve one by ID. The in-memory fixture data is stable, and the API can run and be tested locally without credentials or external services.

## Your assignment

As a shift lead, I want to request a concise AI-generated brief for a recorded incident so that I can quickly understand the reported issue while keeping the original record as the source of truth.

## Acceptance criteria

- `POST /incidents/{incident_id}/brief` returns a brief generated from that incident's recorded data.
- The response identifies the incident and contains a concise, readable brief; it does not assert facts absent from the record or present recommendations as established facts.
- Requesting a brief for an unknown incident returns `404`.
- If the AI provider fails or returns unusable output, the service returns a clear server error rather than a fabricated brief.
- The brief request does not change the incident record or the existing list/detail response shapes.

## Constraints

- Use only the synthetic fixture data; do not send real food-safety or personal data to a provider.
- The feature must be testable without credentials or a network call. Use a configurable/injectable fake AI provider in tests; any real provider integration is optional.
- Treat generated text as untrusted output. A brief is informational and must not change incident status or make safety decisions.
- Keep the existing list and detail endpoints backward-compatible.

## Out of scope

Authentication, persistence, incident editing, automatic escalation or disposition, a frontend, and production deployment are not required.

## Run & verify

Requires Python 3.11 or newer.

```bash
cd challenges/004-quality-incident-briefs
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest -q
python -m uvicorn app.main:app --reload
```

Try the working baseline in another terminal:

```bash
curl http://127.0.0.1:8000/incidents
curl http://127.0.0.1:8000/incidents/INC-1001
```

The list response is a JSON array of incident records. A detail response resembles:

```json
{
  "id": "INC-1001",
  "line": "Filling line 2",
  "category": "Packaging",
  "reported_at": "2025-03-14T09:20:00Z",
  "description": "Several cartons had incomplete top seals during the morning check.",
  "status": "Open"
}
```

The requested brief endpoint currently returns `501 Not Implemented`; this is an intentional contract stub.

## Optional stretch goal

Include a short provenance field in the brief response that identifies which recorded fields were used, without storing generated content.
