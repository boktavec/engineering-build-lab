# Challenge 001 Retrospective — Rail Yard Consignment Search

## Outcome

The existing `GET /consignments` endpoint now supports an optional status query, exact status matching, a useful 400 response for empty or unsupported values, and an empty array when a valid status has no matching records. Omitting the status still returns the full list. The fixed allowed-status list includes states absent from the fixture, which makes the valid-but-unmatched case possible to verify. The final suite passed 23 tests, and `npx tsc --noEmit` passed.

## How problem solving went

A strong early decision was recognizing that the assignment called for extending the existing list route, not adding a separate filter route: when no status is supplied, the same request should still return the full list. You also kept checking concrete behavior rather than relying on assumptions. You asked what the validator returned for inputs, then insisted on actual HTTP calls when route behavior was the thing to verify.

You identified useful edge cases in stages: omitted status, empty status, unsupported values, repeated query keys, exact/case-sensitive matches, and a valid status with no current records. The last case exposed an important modeling distinction: allowed statuses describe the domain, while fixture contents describe current data. Deriving the allowlist from the fixture would make a valid status with no matches impossible.

You also caught and corrected mismatches in the assistance itself. You redirected the work when I gave feedback instead of just reporting return values, when I ran unit-level checks instead of API calls, and when the code under test needed to be refreshed. That kept verification grounded in the code and behavior you actually wanted to assess.

## How AI was used

This retrospective does not count challenge scaffolding as AI assistance for the feature. For the feature work, AI produced or edited substantial code: it implemented changes to the validator and its TypeScript type, selected some entries for the fixed status list, and authored the unit and route tests. You supplied detailed requirements—including the validator's input and return behavior, then the decision to pass or define the allowed statuses independently of fixture contents—and made changes to the function and route yourself. You also specified that route tests should exercise the real API with minimal mocking.

Independent problem solving is not limited to manually typing every line. Here, you did meaningful independent analysis by translating the acceptance criteria into specific function behavior, recognizing that no status should preserve the full-list behavior, distinguishing missing/empty/unsupported/repeated values, and deciding that valid statuses must not be derived from current fixture data. AI was mainly the implementation and test-writing mechanism for portions of that design, not the source of all the problem-solving decisions. In terms of code authorship, assistance was substantial; in terms of defining and refining the contract, you provided substantial direction.

AI was effective as a fast implementation and verification partner, but not as an autonomous driver. Several responses initially missed your immediate request or the latest behavior, so you had to redirect it and ask for concrete results. Your corrections improved the collaboration and kept the checks tied to the behavior you wanted.

## Senior-level signals

- Reasoned from the acceptance criteria to preserve one endpoint and its unfiltered behavior.
- Distinguished absent, empty, invalid, and repeated query values instead of treating every query value as a string.
- Used observations from actual HTTP responses to check assumptions about Express query parsing and route behavior.
- Separated the canonical set of valid statuses from the current fixture data so the empty-result contract could be exercised.
- Asked for real route tests with minimal mocking, while also requesting direct unit coverage for the pure validator.

These are good examples of contract-first thinking, edge-case analysis, and verification judgment. They show senior-level instincts in a small exercise, but do not by themselves establish senior-level ownership or an interview-scale impact story.

## What to practice next

For the next challenge, keep using precise behavior-first instructions when delegating implementation. A compact input/output table for omitted, empty, valid-match, valid-no-match, unsupported, and repeated values can make the contract visible before code is written; you can then decide whether to write the tests yourself or direct AI to implement them. Continue checking actual behavior and steering the agent back when it answers a different question.
