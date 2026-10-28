from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_incidents_returns_fixture_records():
    response = client.get("/incidents")

    assert response.status_code == 200
    assert [incident["id"] for incident in response.json()] == [
        "INC-1001",
        "INC-1002",
        "INC-1003",
    ]


def test_get_incident_returns_matching_record():
    response = client.get("/incidents/INC-1002")

    assert response.status_code == 200
    assert response.json()["category"] == "Temperature"
    assert response.json()["status"] == "Under review"


def test_unknown_incident_returns_not_found():
    response = client.get("/incidents/INC-9999")

    assert response.status_code == 404


def test_brief_route_is_an_unimplemented_contract_stub():
    response = client.post("/incidents/INC-1001/brief")

    assert response.status_code == 501
