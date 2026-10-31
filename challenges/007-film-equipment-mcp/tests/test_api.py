from fastapi.testclient import TestClient

from gear_rental.api import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_and_filter_equipment():
    response = client.get("/equipment")
    assert response.status_code == 200
    assert len(response.json()) == 3

    response = client.get("/equipment", params={"availability": "available"})
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == ["CAM-204"]


def test_get_equipment_and_unknown_id():
    response = client.get("/equipment/CAM-204")
    assert response.status_code == 200
    assert response.json()["name"] == "Asteria 6K cinema camera kit"

    response = client.get("/equipment/DOES-NOT-EXIST")
    assert response.status_code == 404
    assert response.json() == {"error": "Equipment not found"}
