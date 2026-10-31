# Challenge 007 Retrospective — Film Equipment Inventory MCP Server

> Evidence is labeled as observed or learner-reported. Completion reflects the learner's revised scope, which excludes the architecture document.

## Challenge context
- **ID / title:** 007 — Film Equipment Inventory MCP Server
- **Type / difficulty:** Local MCP integration / Level 4
- **Industry / business problem:** A synthetic film-equipment rental house needs read-only inventory lookup for MCP-compatible clients.
- **Technology stack:** Python, MCP Python SDK 2.3.0, stdio, pytest; existing FastAPI inventory API.
- **Skills practiced:** MCP server/tool definitions, stdio client-server sessions, schemas and validation, shared service functions, error signaling, integration testing.
- **Initial familiarity:** Learner read MCP documentation while implementing; precise prior MCP familiarity is unknown.
- **Completion status:** Complete under the learner's revised scope. The learner chose to remove the architecture-document deliverable. The repository README still lists it, so the written brief and revised scope are not yet synchronized.

## Initial understanding and approach
- **Learner recollection:** Initially forgot the MCP tools could call the existing inventory functions directly and expected to make HTTP API requests. This was corrected before the completed implementation; no HTTP calls were added to the MCP tools.
- **Verified requirements:** stdio transport; tool discovery and useful schemas; filtered/unfiltered listing; clear not-found behavior; safe argument handling; shared inventory source; automated MCP-client protocol tests.
- **Approach:** Read the official SDK documentation while implementing and used a real MCP client session to verify the server.
- **Assumptions:** The learner said they initially assumed the MCP server would call the HTTP API. The implemented tools instead call `gear_rental.inventory` directly.

## Implementation journey
- **Learner-reported authorship:** The learner built the MCP server and made its implementation decisions. They used AI for questions and test writing.
- **Observed implementation:** `src/gear_rental/mcp.py` registers `list_equipment` and `get_equipment`, calls the shared inventory functions, and raises `ToolError` for unknown IDs.
- **SDK version correction:** `pyproject.toml` initially pinned MCP 1.12.4 while the learner was reading v2 documentation. The assistant initially gave v1-based guidance and investigated a Pydantic import error. The learner identified the v2 documentation mismatch and requested the v2 update; the assistant changed the pin to 2.3.0 and reinstalled the project. Do not count this version mismatch against the learner.
- **Unexpected behavior:** The server initially constructed but did not raise `ToolError`, so an unknown ID appeared as an empty successful result. After the learner corrected it to raise the error, a live stdio call returned `is_error=True` and a clear not-found message.
- **Scope decision:** The learner removed the architecture-document deliverable from their scope. No architecture document was written.

## Technical implementation
- `list_equipment` and `get_equipment` call `_list_equipment` and `_get_equipment` from `gear_rental.inventory`; they do not make HTTP requests. The HTTP API is a separate entry point using the same inventory source.
- `MCPServer` exposes tool definitions and runs over stdio. The SDK derives argument schemas from function signatures; a numeric `item_id` was rejected before the handler ran.
- Unknown IDs raise `ToolError`; valid filters with no matches return an empty list.
- Inventory helpers are synchronous and read the small packaged JSON fixture. The learner discussed async I/O but did not demonstrate a non-blocking file-I/O implementation; none was required for this local fixture.
- At the retrospective snapshot, `src/gear_rental/mcp_client.py` was an untracked one-line import and was not used or verified. The automated test uses the SDK client directly.

## Testing and verification
- **Observed:** `cd challenges/007-film-equipment-mcp && .venv/bin/python -m pytest -q` — **4 passed**.
- `tests/test_mcp.py` starts the real server as a subprocess using `Client` and `StdioServerParameters` over stdio. It checks server identity, initialization, tool discovery/schemas, unfiltered and filtered calls, combined filters, no matches, a successful lookup, unknown ID, and numeric `item_id` validation.
- The assistant wrote the automated MCP test at the learner's request. The learner reported manually checking both tool calls. In live sessions observed here, tool discovery, list/get results, not-found behavior, and invalid numeric input were exercised.
- No Claude Desktop host session or real LLM/provider was tested; neither is needed for protocol verification.
- The inventory-file missing/corrupt scenario was not tested; it is not an acceptance criterion and is not counted as a gap.

## AI usage
- The learner reports owning the MCP implementation and its design decisions; AI assistance was requested for questions and automated test writing.
- The assistant also updated the dependency pin and installed MCP 2.3.0 at the learner's request. The assistant's earlier v1-based advice was incorrect for the docs the learner was following; the learner challenged it and redirected the work.
- AI-authored tests were run against the real stdio server. No claim is made that the learner independently authored those tests.

## Lessons learned
- MCP transport and backend access are separate: stdio carries MCP messages, while a tool can call local application functions directly.
- Schema validation can reject malformed tool arguments before the handler executes.
- A tool error communicates failure (such as an unknown ID); an empty list communicates a successful query with no matches.
- `async def` alone does not make synchronous I/O non-blocking; `await` requires an awaitable. This was explained during debrief but was not yet demonstrated by the learner.
- For a future cloud-hosted multi-user service, a network transport and identity/authorization would be needed. stdio's limitation is its local subprocess/pipe model, not that it is inherently slow or unable to process asynchronous work.

## Production considerations
The implemented scope is a local, read-only stdio server over synthetic data. Remote hosting, authentication, authorization, auditability, and deployment operations were not implemented or tested. These would be relevant only if the product scope changed to shared cloud access.

## Technical debrief

| Topic / question | Learner answer (summary) | Feedback / follow-up | Demonstrated understanding? |
|---|---|---|---|
| Trace an MCP list call and explain where HTTP fits. | The stdio tool call invokes the functions directly; HTTP API is not involved. | Correct; both entry points share the inventory functions. | Yes |
| Why did numeric `item_id` not reach the handler? | Server input validation caught it first. | Correct; SDK schema validation rejected the value before invocation. | Yes |
| Why distinguish unknown ID from no matches? | An error tells the model/user the call failed; empty results are a valid outcome. | Correct distinction between failed lookup and successful empty query. | Yes |
| Does making the handler async make `read_text()` non-blocking? | Initially thought async handler plus await would permit other calls; then said they were unsure about `read_text()`. | Clarified that synchronous file I/O still blocks; `await` needs an awaitable. | Not yet demonstrated |
| What should happen if inventory data is unavailable? | Give the client a generic failure and log the specific reason to stderr. | Reasonable sanitized-error/logging approach; hypothetical only, not required or implemented. | Discussed |
| Why change transport for cloud multi-user access? | Use HTTP for multiple asynchronous requests; stdio could get slow/messy. | HTTP is appropriate for remote clients, but stdio is not inherently slow or single-request; its main limitation here is local process/pipe coupling. | Partially; distinction needs reinforcement |

## Final assessment

| Category | Weight | Score | Evidence and feedback |
|---|---:|---:|---|
| Problem Understanding | 15% | 4/5 | The final implementation matches the direct shared-inventory and stdio requirements. The initial HTTP assumption was corrected before implementation; no implementation penalty is warranted. Keep tracing existing data flow before choosing a boundary. |
| Problem-Solving and Reasoning | 15% | 4/5 | The learner read the docs, noticed their v2 API did not match the v1 project pin, and challenged the assistant's wrong-version guidance. Check dependency pins against docs at the start of future integrations. |
| Implementation and Correctness | 20% | 4/5 | Live tool calls and protocol tests verify discovery, filtering, successful lookup, not-found, and malformed input. No required behavior gap was established in the learner's revised scope. |
| Testing and Verification | 15% | 4/5 | Real stdio protocol test plus three HTTP API tests; all four passed. The new MCP test was AI-authored at the learner's request. Review its assertions and keep it in the committed branch. |
| Engineering Judgment | 15% | 3/5 | Reusing inventory functions is simple and preserves one source of truth. The debrief showed remaining nuance around async I/O versus transport concurrency; practice explaining those as separate concerns. |
| Technical Understanding | 10% | 3/5 | Direct call flow, schema validation, and error-vs-empty semantics were explained correctly. Async blocking and stdio's limits were partly discussed but not fully demonstrated; revisit with a small teach-back. |
| AI Effectiveness and Ownership | 10% | 4/5 | Learner reports independently building the MCP server and making its design choices, sought help for questions/tests, and corrected the assistant's version mismatch. Review generated tests and verify SDK versions as part of AI-assisted work. |

- **Weighted reflection aid:** 3.75/5 (all categories observed; normalized weights sum to 100%; not an objective measure of ability).
- **Verified outcome:** Local MCP server works over stdio; tool results/errors and schemas were exercised; full test suite passed.
- **Demonstrated strengths:** Corrected an SDK version mismatch using official docs; reasoned accurately about direct data flow and schema validation; distinguished tool errors from valid empty results.
- **Most useful follow-up:** Strengthen the explanation of awaitables/event-loop blocking and distinguish transport choice from concurrency.
- **AI effectiveness:** AI supported troubleshooting and wrote the requested tests; learner reports owning the implementation and decisions. The assistant's initial v1 guidance was wrong for the v2 docs, and the learner caught it.
- **Next learning actions:** Review the generated MCP integration test; practice a short explanation of sync I/O vs async I/O; continue at Level 4 with a varied domain before advancing.
