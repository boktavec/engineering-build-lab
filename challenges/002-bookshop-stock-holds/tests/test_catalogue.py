from fastapi.testclient import TestClient

from src.main import app


client = TestClient(app)


def test_health_check():
    assert client.get("/health").json() == {"status": "ok"}


def test_catalogue_lists_fixture_books():
    response = client.get("/books")
    assert response.status_code == 200
    assert [book["isbn"] for book in response.json()] == ["BK-1001", "BK-1002", "BK-1003"]


def test_catalogue_returns_book_by_isbn():
    response = client.get("/books/BK-1001")
    assert response.status_code == 200
    assert response.json() == {
        "isbn": "BK-1001",
        "title": "The Glass Orchard",
        "author": "Mira Sol",
        "available_copies": 4,
    }


def test_unknown_isbn_returns_not_found():
    assert client.get("/books/unknown").status_code == 404
