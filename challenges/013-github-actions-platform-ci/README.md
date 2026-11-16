# Challenge 013 — Reusable GitHub Actions CI

**Level:** 4 — Systems (Level 4 consolidation)  
**Industry:** Regional travel booking  
**Stack:** TypeScript, Node.js 22, npm, GitHub Actions

## Business context

A travel booking team maintains a small TypeScript service and wants a dependable pull-request quality gate that can later be reused across repositories. CI must produce trustworthy results without exposing write permissions or running deployment steps on untrusted pull requests. The service works locally; its workflow is intentionally absent.

## What already works

The service has a health endpoint, a small test suite, pinned npm dependencies, and a lockfile. `npm test` and `npm run typecheck` run locally. There is no GitHub Actions workflow or reusable pipeline component.

## Your assignment

As a developer-platform engineer, provide a secure, maintainable CI workflow for pull requests and the default branch, with a reusable entry point suitable for adoption by another repository.

## Acceptance criteria

- Pull requests and pushes to the default branch run tests and typechecking with the lockfile-enforcing install command.
- A reusable workflow can be called by another workflow and reports failures to its caller.
- Workflow and job token permissions are least-privilege; untrusted pull-request code receives no write token or secrets.
- Concurrency cancels obsolete runs for the same change without cancelling unrelated branches.
- Workflow syntax/lint validation passes, and the README documents how to run the equivalent checks locally.

## Constraints

- Use GitHub-hosted runners and maintained first-party actions pinned to immutable full commit SHAs.
- Do not add secrets, deployment credentials, third-party services, or paid dependencies.
- Keep the workflow focused on validation; preserve the existing npm scripts and package contract.

## Out of scope

Release publishing, deployment, image building, self-hosted runners, complex matrix strategies, and application feature changes.

## Run & verify

Requires Node.js 22+ and npm. From this directory:

```bash
npm ci
npm test
npm run typecheck
```

Start the baseline with `npm start`, then try `curl http://localhost:3000/health`; it returns `{"status":"ok"}`. After adding the workflow, validate it with `actionlint .github/workflows/*.yml` (install actionlint if needed); review its permissions and trigger behavior before pushing a test branch.

## Optional stretch goal

Add a small dependency or build cache and demonstrate that cache misses do not affect correctness.
