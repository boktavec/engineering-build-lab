# WIP — Challenge 004: Quality Incident Briefs

## Progress note — 2026-10-28 14:16:29 EDT

### Updated direction

I think I need to build an actual graph with nodes rather than only invoking the model directly. The [Thinking in LangGraph guide](https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph) looks like a useful walkthrough. I plan to read it more closely and use it to understand how to convert the current invocation into an explicit graph.

### Progress note — 2026-10-28 14:13:15 EDT

### Current progress

I configured the challenge to call my local model served by oMLX instead of relying only on a fake provider. The standalone model call worked and returned a generated response. I then connected the model call to the brief route and tested `POST /incidents/INC-1002/brief`. The response body contained the expected incident ID and a concise brief based on the recorded temperature incident, but the HTTP status was **501**, so route behavior is not fully aligned with the acceptance criteria yet.

I still need to finish error handling and verify the remaining acceptance criteria, including rejecting empty or over-500-character briefs, handling provider failures, and ensuring unknown IDs return 404.

### LangGraph question / current understanding

I am unsure whether what I have built counts as a LangGraph workflow. My current approach calls the model with a prompt and incident data; I do not use multiple tools. For this incident-brief task, I do not currently see why multiple tools are needed. I can imagine tools being useful if the agent gains more capabilities later, but I do not want to add them just for the sake of using tools.

In the current `app/debrief_agent.py` snapshot, the model is invoked directly with `llm.invoke(...)`; I do not see a LangGraph graph being built or invoked yet. That makes the distinction between a model call and a LangGraph workflow an open learning question for me. I may revisit whether to convert this into an explicit graph after I better understand LangGraph's concepts and the requirements of this task.

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
- **AI assistance:** AI explained configuration and errors, inspected files and diagnostics, and ran route requests to report the observed responses. AI made a small workspace interpreter-setting change and added the explicit `.env.local` path to `app/model.py` after I asked for those changes. No feature tests or graph implementation were added by AI.
- **Ownership boundary:** I am still implementing the workflow and remaining acceptance criteria. This note records observed command outputs separately from my understanding and open questions; it does not claim the feature is complete.
