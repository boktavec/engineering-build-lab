# Challenge 003 Retrospective — Field Reading Cache

> Evidence note: implementation and test behavior below is based on the current working tree and checks run on 2026-10-27. Learner recollections are identified as such; AI interpretation is kept separate. No time estimate is recorded.

## Challenge context

- **ID / title:** 003 — Field Reading Cache
- **Type / difficulty:** API feature with a process-local cache; Level 3
- **Industry / business problem:** Agriculture — repeatedly requested field sensor readings should be cached briefly, while successful submissions appear immediately.
- **Technology stack:** TypeScript, Node.js, Express 5, `node:test`
- **Skills practiced:** Map/array data modeling, TTLs and timestamps, API integration, cache refresh and invalidation, route-level tests, validation, and process-local state.
- **Initial familiarity:** Learner recollection and observed questions: wanted a refresher on TypeScript classes, JavaScript `Map`, array operations, UTC timestamps, and `Date.now()`.
- **Completion status:** **Complete** for the stated challenge acceptance criteria, based on the verification recorded below. Production-scale persistence and multi-process behavior were out of scope.

## Initial understanding and approach

- **My interpretation and desired outcome (learner recollection):** Initially assumed each reading would belong to a different field, so multiple readings per field did not seem necessary. After tracing the GET route, recognized that a field request returns an array of readings.
- **Requirements, constraints, and verified facts:** The brief requires per-field isolation, immediate visibility after a successful POST, expiry refresh from current data, preserved validation/errors and response shapes, a short configurable TTL, and an in-process implementation without external services. Redis was considered but correctly treated as unnecessary for this challenge.
- **Initial plan and alternatives considered (learner recollection):** Store individual readings in an array keyed by field ID, attach insertion timestamps, remove expired items, and return the field's readings. The learner questioned whether an update operation was needed when readings are appended rather than edited.
- **Assumptions:** The first model treated TTL as if each reading independently expired. The later model treated the cached field list as one refreshed snapshot whose readings should share a TTL boundary.

## Implementation journey

- **Major steps and decisions:** The learner wrote the initial `Cache` class and integrated cache reads/writes with the Express routes. Initial data is loaded into the cache; successful POSTs add the reading to the in-memory source list and cache. The current `removeExpired` refreshes the whole field list when the cache is missing, empty, or contains an expired entry.
- **Unexpected behavior / obstacles:** An expiration comparison was initially reversed. Later, an attempted reload returned the wrong data shape and used assignment in a filter predicate, leading to runtime `null` outputs and a TypeScript diagnostic. Directly comparing expected and actual route/cache outputs helped expose these issues.
- **Mistakes or incorrect assumptions and corrections:** The learner clarified that expiry should cause the next GET to load current source data and restart the TTL, rather than return an empty list. On expiry, the final implementation refreshes the complete field list and gives the refreshed entries a common timestamp.
- **How the approach changed / where progress came from:** The learner asked incremental questions about types, arrays, maps, and time; checked outputs; and challenged results when the tested cache did not appear to be the same one used by the routes. The learner also corrected the AI's scope when an earlier request for cache testing was interpreted as permission to wire routes and change tests.

## Technical implementation

- **Changes and data flow:** `challenges/003-field-reading-cache/src/app.ts` stores entries by `fieldId` in `Map<string, CachedData[]>`. Each `CachedData` contains a `Reading` and `insertedAt`. The constructor seeds entries from the backing reading list. GET calls `cache.get()`, which checks expiry, reloads that field from `publicReadings` when needed, refreshes timestamps, and returns the plain reading objects. POST validates input, appends the new reading to the source list, adds it to the cache, and returns the created reading.
- **Configuration:** The `Cache` constructor accepts a TTL in minutes and defaults to two minutes; the app currently passes five minutes.
- **Trade-offs and limitations:** Both source readings and cache live in process memory and reset on restart. Separate processes would have separate source arrays and caches. This is within the exercise constraints, not a production persistence strategy.
- **Relevant tests and commands:** `challenges/003-field-reading-cache/test/app.test.ts`; `npm test`; `npm run typecheck`.

### AI assistance and ownership evidence

- **Learner-authored work evidenced in the interaction:** Initial cache implementation, route integration and seeding, revisions to the cache model/TTL thinking, and diagnosis of the reversed comparison. The learner repeatedly requested concrete outputs and corrected the assistant when it tested the wrong cache instance or exceeded the requested scope.
- **AI-authored work:** After the learner explicitly requested the smallest fix, AI changed the final reload/expiry path in `src/app.ts`. After the learner requested test updates, AI added and revised route/cache tests in `test/app.test.ts`. The learner did not independently author those final changes in this session; passing tests are evidence of behavior, not proof of authorship or independent mastery.
- **Assistance used:** Explanations of TypeScript/JavaScript concepts; direct runtime scenarios; implementation of the final cache refresh correction; and test coverage changes.
- **Scope and verification lesson:** An earlier AI response reported outputs from a separately constructed cache while the learner expected the route's singleton cache. The learner questioned whether readings had actually been inserted and prompted a rerun against the current implementation. This is evidence of useful output-checking and scope correction; it also records that AI runtime claims needed explicit verification.

## Testing and verification

- **Observed checks:** On 2026-10-27, `npm test` passed **5 tests**, and `npm run typecheck` passed. VS Code reported no diagnostics for the touched test file; `app.ts` had no diagnostics in the final code review.
- **Scenarios covered by the current suite:** Existing API behavior, known/unknown GET, valid POST, invalid moisture and invalid date, unknown-field POST, no data change after rejected submissions, repeated field reads, field isolation, immediate POST visibility, and expiry refresh after one cached reading is older while a newer reading remains fresh.
- **Test design:** Route behaviors use the real Express app and HTTP requests. The expiry test uses a separate real `Cache` instance with a fake `Date.now()` clock, so the test does not leave future timestamps in the app's shared cache. The cache itself is not mocked.
- **Remaining verification gap:** Expiry refresh is tested directly on `Cache`; the HTTP route is separately verified to use the cache, but no single test drives a controlled expiry through the singleton Express app. There is no load, restart, multi-process, or persistence test, all outside the exercise's required local scope.

## Lessons learned

- **Clarified concepts:** A TTL cutoff is an epoch timestamp; JavaScript `Date.now()` returns milliseconds, so seconds/minutes need consistent conversion. `Map.set()` replaces a value rather than merging arrays. `filter()` returns a new array. An array of cached entries and the underlying source list serve different roles.
- **Cache semantics:** Expiry applies to the cached snapshot; it does not mean the underlying readings cease to exist. Refreshing the whole snapshot keeps its entries aligned to a shared refresh time. A cache cannot reconstruct current data unless a source of truth exists.
- **Skills to strengthen:** Plan behavioral tests around observable outcomes, trace one cache miss/fresh/expired path before coding, and distinguish the source of truth from its cache. A useful next exercise is to explain and implement a small variant without AI-authored code, then compare it with the verified result.
- **Application to real-world engineering:** A per-process map is appropriate for this local challenge but would diverge across multiple service processes. Sticky routing is not a substitute for shared/persistent source data and robust cache coherence.

## Production considerations

- Store authoritative readings in a shared durable data store if readings must survive restart or be consistent across processes. A shared cache alone does not make the backing reading data durable.
- For multiple service instances, choose an explicit consistency/invalidation strategy; sticky sessions can reduce cross-instance reads but do not solve failover or process restarts.
- Define TTL configuration at the application boundary if operators must change it without editing source. The class accepts a TTL, while the current app sets five minutes in code.
- Add observability and concurrency/failure tests only when the deployment needs them; they were outside this scoped exercise.

## Technical debrief

| Topic / question | My answer (summary) | Feedback / follow-up | Demonstrated understanding? |
|---|---|---|---|
| Explain the expired GET flow and refresh source. | Explained that `get()` checks for a missing or expired list, then reloads from the source with fresh TTL timestamps. | Follow-up confirmed that reload returns all readings for the field, not only expired entries, so their TTLs stay aligned. | Yes; demonstrated in the follow-up. |
| Why refresh the whole list? | “Returns them all in order to keep the ttl aligned across them all. consistency in ttl.” | Correct: the refreshed snapshot gets a shared expiration boundary. | Yes. |
| Why wrap cached readings and unwrap them in `get()`? | `insertedAt` supports the expiry check; it is removed from the response because the API expects plain readings. | Correctly explained both the cache metadata purpose and preserving the response shape. | Yes. |
| What happens after `delete(fieldId)` when source data remains? | It recreates the key and adds the values through `reload()`. | Correct for current implementation: `get()` reaches the missing-cache path and reloads from the source. | Yes. |
| Why does POST update both source and cache? | The underlying list is needed to reload expired entries. | Correct: cache-only data could be lost on refresh. | Yes. |
| What if two Node processes serve requests? | Their caches may be out of sync; suggested a shared cache or routing requests to the same backend. | Correctly identified process-local divergence. Sticky routing is only a mitigation; the source array is also process-local. | Yes, with the limitation discussed. |
| What must happen for readings to survive restart? | They need to be “hosted elsewhere.” | Correct high-level answer; specific storage/consistency choices were not explored. | Yes at a high level. |

## Final assessment

| Category | Weight | Score / status | Evidence and feedback |
|---|---:|---|---|
| Problem Understanding | 15% | **3** | The learner revised the initial one-reading-per-field assumption after examining the endpoint behavior and articulated the needed refresh/source-of-truth behavior. TTL semantics were initially unclear. Recommendation: write the cache miss, hit, write, and expiry outcomes before implementation. |
| Problem-Solving and Reasoning | 15% | **4** | The learner iterated from actual outputs, noticed the comparison-direction issue, questioned mismatched test runs, and corrected the assistant's scope. Improvement: trace the full data path and return types systematically before changing the reload flow. |
| Implementation and Correctness | 20% | **4** | The learner authored most of the cache and route flow, then accurately explained the final `get()` → expiry check → full-source reload behavior, aligned timestamps, and response unwrapping when asked follow-up questions. The final refresh edit was AI-authored, but the learner demonstrated understanding of its behavior; tests and typecheck pass. A small independent variant would further verify transfer. |
| Testing and Verification | 15% | **3** | Real HTTP requests cover route behavior; a real `Cache` instance covers expiry with only the clock faked. Five tests and typecheck passed. The learner's earlier direct-output checks helped expose misunderstandings. The final expiry test does not drive expiry through the app route, and AI authored the final test changes. Recommendation: consider an isolated app/cache fixture if route-level expiry needs verification. |
| Engineering Judgment | 15% | **3** | The learner avoided unnecessary Redis for a process-local exercise and recognized that multi-process caches and in-memory source data diverge. Sticky routing was proposed but its limits were discussed. Recommendation: distinguish durable source-of-truth needs from cache-sharing needs in a production design. |
| Technical Understanding | 10% | **4** | In the debrief, the learner correctly explained the missing/expired path, why reload returns the entire field list, why timestamps are aligned, why the wrapper stores `insertedAt`, and why `get()` removes metadata from the API response. Some syntax and the final refresh implementation were AI-assisted, but the learner demonstrated understanding of the resulting data flow. To strengthen transfer, independently implement the same wrapper/expiry pattern in a small variant. |
| AI Effectiveness and Ownership | 10% | **4** | The learner asked focused questions, requested actual outputs, caught a wrong-instance test, and clarified when AI exceeded scope. AI authored the final refresh fix and test updates, so ownership of those exact changes remains assisted. Continue checking outputs against the intended instance and reviewing generated diffs. |

- **Weighted overall (rough reflection aid):** **3.55 / 5** across all observed categories. This is not an objective measure of ability.
- **Verified outcome / accomplishment:** The stated cache acceptance behavior is implemented; five tests and typecheck pass.
- **Most important improvement area:** Transfer the demonstrated refresh reasoning to an independently implemented variation, and continue designing behavior tests before coding.
- **Demonstrated strengths:** Persistent questioning; evidence-based checking of outputs; clear correction of AI scope and assumptions.
- **Knowledge gaps:** Test isolation was addressed in the test change; production persistence/shared-state design was only discussed at a high level. The final refresh implementation and tests were AI-authored, though the learner demonstrated understanding of the refresh logic during the debrief.
- **Trade-offs / production implications:** Process-local state is simple and meets scope, but resets on restart and diverges between processes. Durable readings and cache coherence would need separate decisions.
- **AI effectiveness:** AI explanations and runtime assistance supported learning, but one earlier run targeted the wrong cache instance and an earlier implementation exceeded the requested scope. The learner identified and corrected both issues. AI wrote the final refresh implementation and test changes.
- **Next learning actions:** (1) Explain the current `reload`/`removeExpired`/`get` path from memory. (2) Try a small TTL-cache variant independently and write its behavior tests first. (3) If pursuing production design, compare a durable source of truth with shared-cache invalidation options.
