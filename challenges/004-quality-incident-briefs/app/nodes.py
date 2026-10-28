
# from langchain.messages import HumanMessage
from model import BriefModel
from state import BriefAgentState, BriefResponse
from langgraph.types import interrupt, Command, RetryPolicy

    # line: str
    # category: str
    # reported_at: str
    # description: str
    # status: str

model = BriefModel()

def read_incident(incident) -> dict:
    return {"id": incident["id"], "line": incident["line"], "category": incident["category"],
    "reported_at":incident["reported_at"],
    "description": incident["description"],
    "status": incident["status"]}


def create_brief(state: BriefAgentState) -> dict:
    llm = model.get_llm()
    structured_llm = llm.with_structured_output(BriefResponse)

    prompt = f"""
    You are an incident agent at a small food manufacturer. Take the following info of a quality incident raised during production and provide a briefing of less than 500 characters in natural language from the data bellow. Only use the information provided to give accurate briefing. NEVER invent info!

    category: {state["category"]}
    reported_at: {state["reported_at"]}
    description: {state["description"]}
    status: {state["status"]}
    """

    response = structured_llm.invoke(prompt)

    return {"brief": response.brief} # type: ignore


def validate_brief(state: BriefAgentState) -> int:
    if(not state["brief"] or len(state["brief"]) == 0):
        return 0
    return 1
