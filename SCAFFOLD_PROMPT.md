# Prompt: Generate my next engineering build challenge

Read `AGENTS.md` and `CHALLENGE_LOG.md` (if it exists). Act in **CHALLENGE CREATOR / SCAFFOLDER** mode.

I want a **new, independent, realistic feature-building exercise** to implement myself. You are responsible for creating the **working starter project** and defining **the feature I must build**. You are **not** responsible for implementing that feature.

## Selection rules

- If there are no prior completed challenges, create **Challenge 001 at Level 1**: easy for an experienced TypeScript/Python developer but still requiring some reasoning, design, and testing.
- For subsequent challenges, gradually increase difficulty based on completed entries in `CHALLENGE_LOG.md`. Increase only a little at a time; if the previous exercise exposed gaps, reinforce the level using a different setting or technology.
- Pick a **different plausible industry and technical theme** than the previous challenge. The exercises don't need to be related.
- Rotate between **TypeScript/Node.js and Python**; choose whichever fits the problem. Occasionally include new technologies, such as a database, middleware, message queue, LangGraph, Docker, Kubernetes, Terraform, observability, or CI/CD.
- Vary the actual nature of the work: adding behavior, integrating a service, introducing a cross-cutting concern, adjusting data handling, creating an AI workflow, changing infrastructure, or improving testing/reliability.
- Aim for **30–75 minutes of implementation after setup** for someone with professional software engineering experience. I am not timed, but avoid multi-hour exercises. Prefer one focused feature with 3–5 observable acceptance criteria.
- Don't ask me to choose the industry or technology unless my request specifies one. Surprise me. Use synthetic data and local/free dependencies.

## What to build now

1. Create `challenges/NNN-short-slug/` as a **standalone runnable baseline application or service**. It should have a believable purpose and already do something useful, but **must not implement my requested feature**.
2. Include reasonable project layout, dependency/config files, fixture data if relevant, and a few **passing baseline tests**. Keep it lightweight and understandable; don't overengineer it.
3. Create a challenge `README.md` with these sections:
   - **Business context:** 2–4 sentences explaining the product and why the requested capability matters.
   - **What already works:** the baseline behavior that I can run immediately.
   - **Your assignment:** a concise user story/problem statement, with no solution path.
   - **Acceptance criteria:** 3–5 observable pass/fail behaviors, including at least one failure/edge case.
   - **Constraints:** realistic requirements or invariants that matter to the design.
   - **Out of scope:** what I do not have to build.
   - **Run & verify:** exact commands for setup, starting, existing tests, and trying the existing functionality. Include sample input/request/output as needed.
   - **Optional stretch goal:** at most one, clearly not required.
4. **Do not implement the assigned feature.** Don't write its business logic, migrations, infrastructure manifests, orchestration graph, or other target artifacts. Don't sneak in a solution through helper methods, tutorial comments, or pseudocode. A minimal `501 Not Implemented` contract stub is fine only if needed to keep the baseline runnable.
5. Let **me** write the feature tests too. Include baseline tests and specific enough acceptance criteria that I can derive feature tests, but don't prewrite the solution's tests unless I ask.
6. Verify the starter genuinely runs and the baseline tests pass **if the tools/environment permit**. Report precisely which commands ran and any environment limitation. Never report a test as passing without running it.
7. Avoid required paid APIs, cloud accounts, secrets, and lengthy infrastructure setup. For AI exercises, use an injectable fake provider so the baseline runs without an API key; the requested integration can still involve LangGraph or a real provider where testable. For infrastructure exercises, keep the target local and narrow (e.g., Docker, kind, or Terraform validation).
8. Do not update the completed-challenge history until I finish the exercise and request a review/log entry.

## After scaffolding

Respond with only:

- **Challenge number, title, level, industry, and stack.**
- **Feature assignment:** a short summary and the key acceptance criteria. No implementation plan.
- **Files created:** important paths, especially the challenge README.
- **How to start:** copyable setup, run, and test commands.
- **Baseline verification:** what was actually executed and the results.

Then stop. Wait for me to implement the feature and ask for help. During implementation, stay in **COACH** mode and use the progressive hint ladder from `AGENTS.md`; do not code the feature unless I expressly ask.

## Optional override for this run

If I add `Focus: <technology or skill>`, incorporate it into the next challenge while preserving the ~one-hour scope and appropriate difficulty. If I add `Difficulty: <level>`, use that level instead of the automatic progression.
