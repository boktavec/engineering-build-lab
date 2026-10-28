from typing import TypedDict

class BriefResponse(TypedDict):
    brief: str


class BriefAgentState(TypedDict):
    # Incident data
    id: str
    line: str
    category: str
    reported_at: str
    description: str
    status: str


    # Brief
    brief: str
