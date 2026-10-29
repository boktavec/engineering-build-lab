from fastapi import FastAPI, HTTPException

from app.data import INCIDENTS
from app.providers import TextProvider
from app.debrief_agent import build_agent
from app.model import BriefModel

def create_app(provider: TextProvider | None = None) -> FastAPI:
    app = FastAPI(title="Quality Incident Register")
    if provider is None:
        provider = BriefModel()

    app.state.text_provider = provider

    agent = build_agent(provider)

    @app.get("/incidents")
    def list_incidents() -> list[dict[str, str]]:
        return INCIDENTS

    @app.get("/incidents/{incident_id}")
    def get_incident(incident_id: str) -> dict[str, str]:
        incident = next((item for item in INCIDENTS if item["id"] == incident_id), None)
        if incident is None:
            raise HTTPException(status_code=404, detail="Incident not found")
        return incident

    @app.post("/incidents/{incident_id}/brief")
    def create_brief(incident_id: str) -> None:
        incident = next((item for item in INCIDENTS if item["id"] == incident_id), None)
        if incident is None:
            raise HTTPException(status_code=404, detail="Incident not found")

        try:
            response = agent.invoke(incident) # type: ignore
        except Exception:
            raise HTTPException(status_code=500, detail="Brief generation failed")

        if"err" in response:
            raise HTTPException(status_code=500, detail=response["err"])

        return {"id": response["id"], "brief": response["brief"]} # type: ignore

    return app


app = create_app()
