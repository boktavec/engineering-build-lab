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
- [ ] Python services
- [x] Middleware / auth / validation
- [ ] Relational data / migrations
- [ ] Caching / async work / queues
- [x] Testing / mocking / integration tests
- [ ] External APIs / webhooks
- [ ] AI integration / LangGraph
- [ ] Docker / Kubernetes
- [ ] Terraform / IaC
- [ ] CI/CD / observability / reliability
- [ ] Security / data integrity

The checklist tracks coverage, not mandatory ordering. Mark a topic only when truly practiced.
