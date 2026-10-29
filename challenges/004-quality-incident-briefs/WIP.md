# WIP — Challenge 004: Quality Incident Briefs

## Progress note — 2026-10-29 00:02:21 EDT

### Final reflection and status

Once I understood how state and nodes work, building the workflow and connecting it to the route became pretty straightforward. The provider abstraction took more guidance: I initially did not know where to start or what to look at, but talking it through with AI and seeing examples helped me understand how to implement it and why it is useful.

This was my first time using LangGraph. It feels similar to n8n, with more flexibility because I define the nodes and workflow directly. I now feel I have a decent practical understanding and could discuss the core concepts, while recognizing there is still a lot more to learn. I may try converting my n8n RAG workflow to LangGraph. I also want hands-on experience creating and using tools where they provide real value; this brief workflow did not need tools.

I estimate this challenge took roughly 4–7 hours across yesterday and today. That reflects learning the framework while implementing it, not just the amount of code.

The implementation is complete. The test suite reports 10 passed, and the real oMLX happy path was previously verified. The fake provider covers invalid generated output and provider exceptions; actual oMLX outages and concurrent load remain unverified. The LangGraph workflow is intentionally small, with one node between `START` and `END`.

## Progress note — 2026-10-28 18:42:27 EDT

### Current understanding and final outcome

I am starting to understand state and nodes. A node is a function that performs one step; it can return a dictionary of state updates, and fixed graph edges determine what runs next. `Command` is not needed just to update state; it can be used when a node needs to update state and dynamically choose where to go next. For this fixed flow, ordinary edges are enough.

The graph receives the incident data as its initial state through `agent.invoke(incident)`. Nodes can read the current state and return partial updates, which LangGraph merges. The graph returns its final state, and the route selects the response fields. I initially had a `read_incident` node that copied data already present in initial state; after understanding the flow, I removed it as redundant. The final graph is a small explicit workflow: `START -> create_brief -> END`.

I wanted to use an actual LLM from the start. My first approach was a direct chat invocation, which connected to oMLX but did not itself build the LangGraph workflow I wanted to learn. The hardest concept at first was how state flows into nodes and how node functions work with that data. Once I understood this, building the workflow and connecting it to the route was relatively straightforward.

I now have a decent working understanding of LangGraph and feel I could discuss its core concepts, while recognizing there is still much more to learn. It feels similar to n8n in purpose, but more flexible because I manually define the nodes and graph. I may try converting my n8n RAG workflow to LangGraph. I also want hands-on experience creating and using tools where they solve a real need; this challenge did not need tools.

### Current implementation and verification

- `app/model.py` wraps the oMLX-compatible `ChatOpenAI` client in `BriefModel`, whose `generate(input_text)` method returns generated brief text.
- `app/providers.py` defines the `TextProvider` protocol. `BriefModel` is the real provider; `tests/fakes.py` provides a fake with the same interface. `create_app()` defaults to `BriefModel()` but tests can explicitly pass a fake. Provider choice is made at app creation, not based on incident state and not by silently falling back when oMLX is unavailable.
- `app/debrief_agent.py` builds and compiles the graph once per app, using a provider-bound node from `app/nodes.py`.
- The node builds a prompt from incident category, reported time, description, and status; it returns `{"brief": ...}` for non-empty output up to 500 characters, otherwise `{"err": ...}`. The route returns the ID from state and the generated brief.
- Invalid returned text and provider exceptions are separate paths. The node represents invalid text as an error state update; the route turns that into an HTTP 500 with a validation description. A provider exception propagates from `agent.invoke`; the route catches it and returns a generic HTTP 500 description.
- `pytest -q` reports **10 passed** (28 dependency deprecation warnings). TestClient coverage uses the fake provider for successful output, empty and overlong output, unknown IDs, provider exceptions, supplied incident facts, and unchanged incident/list/detail data.
- A live Uvicorn request to the local oMLX model previously returned a valid brief for `INC-1002` with HTTP 200; list/detail routes returned 200 and unknown IDs returned 404. The live happy-path check occurred before the final exception-handler edit; the final provider-failure path is verified with the fake.

### Remaining verification and production questions

I have not organically induced an oMLX failure or load-tested many concurrent requests. A fake-provider baseline can help separate route/graph overhead from model generation, but it does not reproduce oMLX latency or contention. A useful comparison should use the same concurrency and measure latency percentiles, throughput, and failures, alongside oMLX server/resource observations. I should also consider finite timeouts, safe provider-error logging, whether the prompt should include `line`, and how to evaluate factual grounding. Prompt instructions alone do not guarantee the model will never invent details.

### Implementation journey and AI use

The provider interface took substantial guidance to understand and implement. I initially did not know where to start or what to look at; discussing the protocol with AI and seeing unrelated examples helped me understand that it describes a shared method shape, while the real and fake providers are concrete implementations. I now understand the benefit: the app can use the real provider normally and tests can explicitly inject a controlled fake without duplicating workflow code.

Other issues encountered across the challenge included selecting the correct Python interpreter, explicitly loading `.env.local`, LangGraph package-version/import problems, package-qualified sibling imports, dictionary-versus-object access, and returning HTTP 501 because the route decorator still declared that status. Inspecting actual responses exposed that the prompt initially did not include incident data and that the route's success/error handling needed adjustment. I also corrected my understanding that provider exceptions are not automatically converted to HTTP errors: they propagate from invocation and must be caught by the route.

AI helped explain concepts, inspect code and errors, and provided implementation guidance. AI also authored the route tests and updated the README description; those tests were run. I used the observed test and live-request results to verify behavior rather than treating explanations as proof. I estimate the challenge took roughly **4–7 hours across yesterday and today**, largely because LangGraph was new and I was learning as I built.

## Progress note — 2026-10-28 14:16:29 EDT

### Updated direction

I think I need to build an actual graph with nodes rather than only invoking the model directly. The [Thinking in LangGraph guide](https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph) looks like a useful walkthrough. I plan to read it more closely and use it to understand how to convert the current invocation into an explicit graph.

## Progress note — 2026-10-28 14:13:15 EDT

### Current progress

I configured the challenge to call my local model served by oMLX instead of relying only on a fake provider. The standalone model call worked and returned a generated response. In an earlier code snapshot, I connected the model call to the brief route and tested `POST /incidents/INC-1002/brief`; it returned a brief body for `INC-1002` with HTTP **501**. That was evidence of an earlier iteration, not the current route: the current `app/main.py` has the brief endpoint back at its 501 stub.

I still need to finish error handling and verify the remaining acceptance criteria, including rejecting empty or over-500-character briefs, handling provider failures, and ensuring unknown IDs return 404.

### LangGraph question / current understanding

I am unsure whether what I have built counts as a LangGraph workflow. My current approach calls the model with a prompt and incident data; I do not use multiple tools. For this incident-brief task, I do not currently see why multiple tools are needed. I can imagine tools being useful if the agent gains more capabilities later, but I do not want to add them just for the sake of using tools.

In the current `app/debrief_agent.py` snapshot, the model is invoked directly with `llm.invoke(...)`; I do not see a LangGraph graph being built or invoked yet. That makes the distinction between a model call and a LangGraph workflow an open learning question for me. I may revisit whether to convert this into an explicit LangGraph graph after I better understand the framework's concepts and the task's needs.

### Issues encountered and what I learned

- Python tooling initially failed because `mise` had no Python version configured for the `python`/`pip` shims. I activated the challenge `.venv` and installed dependencies there.
- The model client required `OPENAI_API_KEY`. I found the local server key and configured environment variables, including `LLM_MODEL`.
- `load_dotenv()` without a path did not load my `.env.local`; the loader needed an explicit path to that file. VS Code also initially reported `dotenv` unresolved because its selected interpreter did not match the challenge virtual environment.
- A LangChain/LangGraph import failed because installed package versions were mismatched: `langgraph-prebuilt` expected `ExecutionInfo` from `langgraph.runtime`, but the installed `langgraph` version did not provide it. Importing the unused `langchain.tools` symbol triggered that import chain.
- Python sibling-module imports failed when modules were imported as part of the `app` package. Updating imports to use the package context allowed execution to proceed.
- The incident fixture is a dictionary, while the generated structured response is a Pydantic `Brief` object. I encountered errors from treating one as the other (`incident.id` versus dictionary key access, and dictionary indexing versus model attributes). The route passes the incident dictionary to `call_agent`.
- The first model response contained invented incident details because the incident data was not interpolated into the prompt. I noticed this by inspecting the output; the prompt was subsequently changed to include the incident value.
- The route test first failed with a 500 when `call_agent` tried to access `.id` on the incident dictionary. After that was corrected, the route returned a JSON brief body, but its response status remained 501.

### Current focus

Complete the route's error handling and acceptance-criteria checks, and decide—based on understanding the framework and the task's needs—whether to express the model call as an explicit LangGraph graph. Avoid adding tools unless they solve a real requirement.

### AI use and ownership

- **My work:** I configured the local oMLX model and environment, connected it to my brief-generation code and route, and investigated behavior by running the script and testing the route. I used output inspection to catch that the model was not receiving the incident data.
- **AI assistance:** AI explained configuration and errors, inspected files and diagnostics, and ran route requests to report the observed responses. AI made a small workspace interpreter-setting change and added the explicit `.env.local` path to `app/model.py` after I asked for those changes. No feature tests or graph implementation were added by AI at this earlier point.
- **Ownership boundary:** I was still implementing the workflow and remaining acceptance criteria. This note records observed command outputs separately from my understanding and open questions; it does not claim the feature is complete.
