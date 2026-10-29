from langgraph.graph import StateGraph, START, END
from app.state import BriefAgentState
from app.nodes import make_create_brief

def build_agent(provider):



    agent = (
        StateGraph(BriefAgentState)
        .add_node("create_brief", make_create_brief(provider))
        .add_edge(START, "create_brief")
        .add_edge("create_brief", END)
        .compile()
    )
    return agent
