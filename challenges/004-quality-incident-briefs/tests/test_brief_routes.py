import pytest
from fastapi.testclient import TestClient

from app.data import INCIDENTS
from app.main import create_app
from tests.fakes import FakeTextProvider


def test_brief_route_returns_generated_brief_and_sends_incident_facts_to_provider():
    provider = FakeTextProvider(response="A controlled test brief.")
    client = TestClient(create_app(provider))
    incident = next(item for item in INCIDENTS if item["id"] == "INC-1002")

    response = client.post("/incidents/INC-1002/brief")

    assert response.status_code == 200
    assert response.json() == {"id": "INC-1002", "brief": "A controlled test brief."}
    assert len(response.json()["brief"]) < 500
    assert len(provider.inputs) == 1
    for fact in ("category", "reported_at", "description", "status"):
        assert incident[fact] in provider.inputs[0]


@pytest.mark.parametrize("brief", ["", "x" * 501])
def test_brief_route_rejects_empty_or_overlong_generated_brief(brief: str):
    client = TestClient(create_app(FakeTextProvider(response=brief)))

    response = client.post("/incidents/INC-1002/brief")

    assert response.status_code == 500
    assert response.json() == {
        "detail": "Brief is either empty or too many characters. Please try again."
    }


def test_brief_route_returns_404_for_unknown_incident_without_calling_provider():
    provider = FakeTextProvider()
    client = TestClient(create_app(provider))

    response = client.post("/incidents/INC-9999/brief")

    assert response.status_code == 404
    assert response.json() == {"detail": "Incident not found"}
    assert provider.inputs == []


def test_provider_failure_returns_clear_server_error():
    provider = FakeTextProvider(error=RuntimeError("simulated provider outage"))
    client = TestClient(create_app(provider), raise_server_exceptions=False)

    response = client.post("/incidents/INC-1002/brief")

    assert response.status_code == 500
    assert response.headers["content-type"].startswith("application/json")
    assert response.json()["detail"]


def test_brief_generation_does_not_mutate_incident_or_change_endpoint_shapes():
    provider = FakeTextProvider(response="A controlled test brief.")
    client = TestClient(create_app(provider))
    before_list = client.get("/incidents").json()
    before_detail = client.get("/incidents/INC-1002").json()

    response = client.post("/incidents/INC-1002/brief")

    assert response.status_code == 200
    assert client.get("/incidents").json() == before_list
    assert client.get("/incidents/INC-1002").json() == before_detail
    assert set(before_detail) == {
        "id", "line", "category", "reported_at", "description", "status"
    }
