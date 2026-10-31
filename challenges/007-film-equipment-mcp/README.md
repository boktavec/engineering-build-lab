# Challenge 007 — Film Equipment Inventory MCP Server

**Level 4 · Film and television production · Python, FastAPI, Model Context Protocol (MCP) · Suggested effort: one focused day**

## Business context

A small production equipment rental house manages camera, audio, and lighting gear for film crews. Production coordinators need to check what is available without calling the rental desk, but the inventory system must remain read-only to automated assistants. The shop wants a local MCP integration so MCP-compatible clients can answer equipment questions from the current inventory source.

## What already works

A runnable FastAPI service exposes synthetic equipment inventory. It supports health checks, listing and filtering items, and looking up a specific item by ID. The fixture includes available, reserved, and maintenance equipment; API tests use the real application through FastAPI's test client.

## Your assignment

As a developer at the rental house, add a local MCP server that lets an MCP-compatible client safely discover and query the equipment inventory using the MCP protocol. The server must expose information only: it must not reserve, check out, or modify equipment.

## Acceptance criteria

- An MCP client can launch and connect to the server over **stdio**, initialize a session, and discover the inventory tools and their useful descriptions/input schemas through MCP.
- `list_equipment` supports category and/or availability filters. Omitting filters returns all items; valid filters with no matches return an empty result. `get_equipment` returns the matching item's details; an unknown ID produces a clear not-found result without crashing the server.
- Results and errors are understandable to both a human and an AI client. Invalid or malformed arguments are handled safely, and tool output stays within the documented inventory contract.
- MCP tools use the same source as the HTTP API. No second hard-coded fixture exists, and no tool can reserve/modify equipment, run a process, make a network request, or access arbitrary files.
- Logs and diagnostics go to stderr, never stdout (stdio is the MCP protocol channel). A client can use the server without log text corrupting the protocol stream.
- Tests exercise the real MCP server through an MCP client session over the chosen transport—not just the underlying helper functions—and cover initialization/discovery, filtered and unfiltered calls, unknown IDs, and at least one invalid-input or no-match case. Existing HTTP API tests continue to pass.

## Constraints

- Use the Python MCP SDK specified in `pyproject.toml`; use synthetic equipment data only.
- Keep the server read-only. No tool may launch a process, call an external service, access arbitrary files, or reserve/change equipment.
- This exercise is a local MCP server, not a multi-tenant hosted service. Authentication, remote transport, persistent storage, and live LLM/provider integration are not required.
- Do not require API keys or paid services. MCP clients can call the server directly during protocol-level testing; no language model is needed to verify correct MCP behavior.
- Keep the HTTP API's existing response behavior stable. Add only the MCP capability requested.

## Out of scope

Agent planning/orchestration, equipment reservations or checkout, remote hosting, OAuth/authentication for remote clients, cloud deployment, metrics dashboards, and real provider integrations are not required. The server is a local stdio integration over synthetic data, not a production multi-tenant service. Be explicit about these limits rather than adding production infrastructure that the exercise cannot meaningfully validate.

## Case-study deliverable

Add a concise `docs/architecture.md` (about 1–2 pages) that you can use to explain the project in an interview. Include:

- The user problem and a small client → MCP server → inventory-source diagram.
- The tool contracts, example inputs/outputs, empty/not-found/invalid-input behavior, and why the descriptions/schemas help a client choose and call tools.
- The trust boundary and threat analysis for model-supplied arguments: what the server allows, what it intentionally cannot do, and remaining risks.
- Why stdio fits this local use case; what would need to change before remote, multi-user deployment (transport, identity/authorization, secrets, auditability, operations).
- Test evidence for both successful calls and a failure/edge case, plus one observed limitation and the next improvement you would prioritize.

Keep it evidence-based: distinguish behavior you implemented and verified from future production recommendations. The document is not a design recipe; your implementation choices and trade-offs are yours.

## Run & verify

Requires Python 3.11 or newer. From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[dev]'
pytest -q
```

Start the existing HTTP API:

```bash
uvicorn gear_rental.api:app --reload --app-dir src
```

In another terminal, try the baseline behavior:

```bash
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1:8000/equipment
curl -i 'http://127.0.0.1:8000/equipment?availability=available'
curl -i http://127.0.0.1:8000/equipment/CAM-204
curl -i http://127.0.0.1:8000/equipment/DOES-NOT-EXIST
```

The list endpoint returns three synthetic items. The availability filter returns `CAM-204`; the unknown ID returns HTTP 404 with `{"error":"Equipment not found"}`. The MCP server does not exist yet—that is the assigned feature. Document its launch command and how you connected a client to it when you finish.

## Optional stretch goal

Add a read-only MCP resource for an equipment item and compare its use with the `get_equipment` tool. Do not add remote transport or authentication unless you can test the full trust boundary locally.
