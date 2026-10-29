from fastapi.testclient import TestClient

from app.main import create_app
from tests.fakes import FakeTextProvider

client = TestClient(create_app(FakeTextProvider()))


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



def test_app_accepts_an_injected_provider_for_offline_feature_tests():
    provider = FakeTextProvider(response="A controlled test brief.")

    test_app = create_app(provider)

    assert test_app.state.text_provider is provider
