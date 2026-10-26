# Challenge 001 Retrospective — Rail Yard Consignment Search

## Outcome

The existing `GET /consignments` endpoint now supports an optional status query, exact status matching, a useful 400 response for empty or unsupported values, and an empty array when a valid status has no matching records. Omitting the status still returns the full list. The fixed allowed-status list includes states absent from the fixture, which makes the valid-but-unmatched case possible to verify. The final suite passed 23 tests, and `npx tsc --noEmit` passed.

## How problem solving went

A strong early decision was recognizing that the assignment called for extending the existing list route, not adding a separate filter route: when no status is supplied, the same request should still return the full list. You also kept checking concrete behavior rather than relying on assumptions. You asked what the validator returned for inputs, then insisted on actual HTTP calls when route behavior was the thing to verify.

You identified useful edge cases in stages: omitted status, empty status, unsupported values, repeated query keys, exact/case-sensitive matches, and a valid status with no current records. The last case exposed an important modeling distinction: allowed statuses describe the domain, while fixture contents describe current data. Deriving the allowlist from the fixture would make a valid status with no matches impossible.

You also caught and corrected mismatches in the assistance itself. You redirected the work when I gave feedback instead of just reporting return values, when I ran unit-level checks instead of API calls, and when the code under test needed to be refreshed. That kept verification grounded in the code and behavior you actually wanted to assess.

## How AI was used

AI involvement was substantial in code production. It scaffolded the starter, converted the HTTP implementation to Express, edited the validator and its TypeScript types, expanded the fixture, and authored the unit and route tests. You supplied the behavior and constraints, made changes to the function and route yourself, chose to use a fixed status list, and repeatedly clarified which behavior should be tested and how.

Overall, AI was effective as a fast implementation and verification partner, but not as an autonomous driver. Several responses initially missed your immediate request or the latest behavior, so you had to redirect it and ask for concrete results. The session was collaborative, with high AI assistance for implementation and tests and meaningful user direction on API semantics, edge cases, and verification boundaries. This was not an independent implementation exercise.

## Senior-level signals

- Reasoned from the acceptance criteria to preserve one endpoint and its unfiltered behavior.
- Distinguished absent, empty, invalid, and repeated query values instead of treating every query value as a string.
- Used observations from actual HTTP responses to check assumptions about Express query parsing and route behavior.
- Separated the canonical set of valid statuses from the current fixture data so the empty-result contract could be exercised.
- Asked for real route tests with minimal mocking, while also requesting direct unit coverage for the pure validator.

These are good examples of contract-first thinking, edge-case analysis, and verification judgment. They show senior-level instincts in a small exercise, but do not by themselves establish senior-level ownership or an interview-scale impact story.

## What to practice next

For the next challenge, try writing the acceptance-test cases yourself before implementation. A compact input/output table for omitted, empty, valid-match, valid-no-match, unsupported, and repeated values would have made the contract explicit early. Use AI first as a coach or reviewer, and ask it to implement only when you choose; continue requiring it to distinguish direct function tests from real API calls.
