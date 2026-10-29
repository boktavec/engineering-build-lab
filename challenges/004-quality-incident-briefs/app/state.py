from typing import TypedDict, NotRequired

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
    brief: NotRequired[str]

    # Error
    err: NotRequired[str]
