# Challenge 009 — Enterprise SSO for an MCP Server

**Senior Software Engineer · Level 5 · Internal developer platform · TypeScript, Node.js, Keycloak, Docker, MCP · Suggested effort: full day**

## Scenario

Your company maintains an internal application used by employees authenticated through enterprise SSO. Engineering teams want to access its capabilities from an MCP client rather than switching to the web interface. The company uses an enterprise identity provider; for this local exercise, Keycloak provides the identity service.

## Working baseline

This directory contains a small internal application—not the requested MCP integration. It has a browser UI with Keycloak sign-in, a REST API that validates Keycloak access tokens, synthetic projects, and role-based access rules. The `employee` user can view internal projects; `project-manager` can also view confidential projects and create projects. Automated baseline tests exercise the application behavior without needing a running Keycloak instance.

Keycloak realm import provides two local users:

| Username | Password | Roles | Application access |
|---|---|---|---|
| `alex.employee` | `employee-pass` | `employee` | Read internal-classification projects |
| `sam.manager` | `manager-pass` | `employee`, `project-manager` | Read all projects and create projects |

These are disposable local-only credentials. Do not use them outside this exercise.

## Your assignment

Implement a secure MCP integration that allows authenticated employees to use the internal application's capabilities through an MCP client, preserving each user's identity and existing application permissions. Users must authenticate using the existing Keycloak identity provider.

The finished experience should connect an MCP client to your MCP service using Streamable HTTP, use browser-based SSO, and let users invoke meaningful tools backed by the existing REST API. Authentication, authorization, downstream identity, and failure behavior are part of the engineering problem. You own the architecture and implementation decisions.

## Acceptance criteria

Demonstrate with repeatable tests or a scripted verification that:

- An MCP client connects to the MCP server using Streamable HTTP.
- A user can authenticate through the existing Keycloak realm using a browser-based authorization flow.
- An authenticated user can discover and invoke MCP tools backed by the internal application.
- The application sees the correct user identity and applies its existing access rules; the employee and manager receive different access outcomes.
- Invalid, expired, wrong-issuer, wrong-audience, and insufficiently scoped credentials are rejected at the appropriate boundary.
- Unauthenticated requests cannot reach protected operations.
- Authentication failures, authorization denials, and token expiration produce safe, understandable client behavior; expired credentials do not silently become success.
- MCP access does not bypass application authorization or forward credentials to an unintended audience.
- Automated tests cover successful and rejected authentication/authorization behavior, including different users and token validation failures.

Provide evidence for each criterion. State clearly what was tested with the real Keycloak-to-MCP-client flow versus test keys, HTTP clients, or other local substitutes.

## Constraints

- Use TypeScript/Node.js and the official MCP TypeScript SDK; use Streamable HTTP for MCP client integration.
- Use the provided Keycloak realm and the existing application API as the identity provider and downstream system.
- Preserve the baseline API's behavior and permissions. The mock application and its routes are supporting infrastructure, not the feature to redesign.
- Use synthetic data and local infrastructure. No paid service, real employee identity, or production credential is needed.
- Make and explain the architectural decision about token exchange and delegated downstream API access. Do not forward a token to a service/audience for which it was not issued.
- Keep the MCP service and application independently runnable/testable. Add tests of your own for the challenge; the baseline tests are not challenge contract tests.

## Out of scope

Production hosting, integration with a real corporate IdP, a public SaaS deployment, provisioning real business resources, and redesigning the mock application are not required. Do not add unrelated capabilities or dependencies.

## Application capabilities and API contract

Base URL: `http://localhost:3000`.

| Method and path | Authentication | Behavior |
|---|---|---|
| `GET /health` | None | `200 {"status":"ok"}` |
| `GET /api/me` | Bearer Keycloak access token | `200 {"username":"...","roles":[...]}` |
| `GET /api/projects` | Bearer Keycloak access token | `200 {"projects":[...]}`; employees see internal records, project managers see both classifications |
| `POST /api/projects` | Bearer token with `project-manager` role | `201 {"project":...}` for `{"name":"..."}`; missing/blank name returns `400`; employee-only token returns `403` |

Project records have `id`, `name`, `owner`, and `classification`. Unauthenticated/invalid API requests receive `401`; authorized identity without the required role receives `403`. The API validates token signature, issuer, audience, expiry, and the RS256 algorithm. This is baseline application behavior; the challenge is to integrate with it without weakening its controls.

## Setup, run, and test

Requirements: Node.js 20+ and Docker Compose.

Start Keycloak and import the local realm:

```bash
docker compose up -d
```

Wait for Keycloak at <http://localhost:8080> to finish starting. Then in this directory:

```bash
npm ci
npm test
npm run typecheck
npm run dev
```

Open <http://localhost:3000>, choose **Sign in with SSO**, and sign in as either user above. Keycloak's development login screen is local and disposable. The UI loads the project list from the API using the authenticated identity.

Example API checks after obtaining a token from the browser session or your own test setup:

```bash
curl -i http://localhost:3000/health
curl -i -H 'Authorization: Bearer <access-token>' http://localhost:3000/api/me
curl -i -H 'Authorization: Bearer <access-token>' http://localhost:3000/api/projects
```

Stop the identity provider with `docker compose down`. To discard its local state and re-import the realm, use `docker compose down -v` (this deletes the local Keycloak database).

## AI assistance tier

**Limited.** AI may help with protocol/library documentation research, conceptual explanations, troubleshooting hints, test strategy, and code review. AI must not write or directly implement the challenge solution, including MCP server/authentication code or its tests. Keep implementation decisions and code development under your ownership. If assistance is provided, record what you asked, what you accepted or rejected, and how you independently verified it in the retrospective. The supporting mock application is not assessed and may be generated or troubleshot with unrestricted AI assistance; it has already been generated for this starter.

## Verification and completion

Keep a short evidence checklist linking each acceptance criterion to test names, commands, and observed results. Include at least one full local sign-in-to-tool-call walkthrough and distinct outcomes for both seeded identities. Do not claim end-to-end compatibility based only on unit tests. On completion, request the standard Engineering Lab review and retrospective; the seven-category rubric, interactive technical debrief, and AI ownership evaluation apply. `RETROSPECTIVE.md` is provided as a blank template and must be filled with your actual process and evidence during the debrief.
