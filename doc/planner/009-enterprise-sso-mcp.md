# Challenge 009 — Enterprise SSO for an MCP Server

## Scope
Create an independent TypeScript/Node.js challenge with a runnable Keycloak-backed internal application as supporting infrastructure. Keep the assessed MCP server and its MCP-specific OAuth configuration absent. Provide the learner with a realistic secured API and two user identities with distinct application permissions.

## Repository changes
- Add `challenges/009-enterprise-sso-mcp/README.md` describing scenario, baseline, assignment, acceptance criteria, constraints, verification, and full-day senior-level scope without implementation recipe.
- Add a minimal internal web UI and REST API with Keycloak SSO, API JWT validation, role-based per-user authorization, synthetic business records, and tests.
- Add a Keycloak realm import with local-only test users/clients/roles, Docker Compose, and exact startup/reset commands.
- Document API capabilities/contracts and distinguish baseline verification from the unimplemented challenge.
- Add the required retrospective template copy and update challenge index.
- Do not change the challenge log's historical progress/completion entries.

## Security and learning boundaries
- Support application uses Keycloak only as local identity infrastructure; its web/API realm config is generic for the mock app, not the MCP integration.
- API enforces its own permissions for every request and uses bearer-token audience/issuer/signature/expiry checks.
- Do not create MCP code, MCP server endpoints, MCP OAuth metadata, MCP client configuration, or implementation walkthroughs.
- Include synthetic credentials only, explicitly local-only, and avoid actual secrets.

## Validation
Run the baseline API/UI test suite and TypeScript checks where practical. Verify compose configuration and document integration behavior; do not claim Keycloak end-to-end was run unless the Docker environment supports it. Review changes against the README acceptance criteria and ensure no MCP solution artifacts exist.
