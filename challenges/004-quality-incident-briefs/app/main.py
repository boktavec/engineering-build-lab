from fastapi import FastAPI, HTTPException

from app.data import INCIDENTS
from app.providers import TextProvider


def create_app(provider: TextProvider | None = None) -> FastAPI:
    app = FastAPI(title="Quality Incident Register")
    app.state.text_provider = provider

    @app.get("/incidents")
    def list_incidents() -> list[dict[str, str]]:
        return INCIDENTS

    @app.get("/incidents/{incident_id}")
    def get_incident(incident_id: str) -> dict[str, str]:
        incident = next((item for item in INCIDENTS if item["id"] == incident_id), None)
        if incident is None:
            raise HTTPException(status_code=404, detail="Incident not found")
        return incident

    @app.post("/incidents/{incident_id}/brief", status_code=501)
    def create_brief(incident_id: str) -> None:
        raise HTTPException(status_code=501, detail="Incident briefs are not implemented")

    return app


app = create_app()
