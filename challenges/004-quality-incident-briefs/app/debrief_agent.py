from app.model import BriefModel
from pydantic import BaseModel
# from data import INCIDENTS

from typing import TypedDict


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


# def create_brief()

# class Brief(BaseModel):
#     id: str
#     brief: str

# class Incident(BaseModel):
#     id: str
#     line: str
#     category: str
#     reported_at: str
#     description: str
#     status: str


# llm = model.with_structured_output(Brief)

# def call_agent(incident: Incident):

#     report_id = incident["id"] # type: ignore

#     message = [
#         (
#             "system",
#             "You are an incident brief agent at a small food manufacturer. You will be given a record of a quality incident raised during production. Provide a briefing of less than 500 characters in natural language from the data you are given. Only use the information provided to give accurate briefing. NEVER invent info! Return the ID provided as the id. ",
#         ),
#         ("human", f"Create a briefing from the following data: {incident}"),
#     ]

#     response = llm.invoke(message)

#     if len(response.brief) > 500 or len(response.brief) == 0:  # type: ignore
#         return {"err_id": 1, "message": "brief was too large or empty"}

#     if response.id != report_id: # type: ignore
#         response.id = report_id # type: ignore
#         return response

#     return response


# response = call_agent(INCIDENTS[0]) # type: ignore
# print(response)

    # {
    #     "id": "INC-1001",
    #     "line": "Filling line 2",
    #     "category": "Packaging",
    #     "reported_at": "2025-03-14T09:20:00Z",
    #     "description": "Several cartons had incomplete top seals during the morning check.",
    #     "status": "Open",
    # },
