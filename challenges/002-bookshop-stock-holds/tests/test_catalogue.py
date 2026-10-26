import json

from db.books import BOOKS_PATH


def test_health_check(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_catalogue_list_keeps_original_response_shape(client):
    response = client.get("/books")

    assert response.status_code == 200
    assert response.json() == [
        {
            key: book[key]
            for key in ("isbn", "title", "author", "available_copies")
        }
        for book in json.loads(BOOKS_PATH.read_text())
    ]


def test_catalogue_returns_book_by_isbn(client):
    response = client.get("/books/BK-1001")

    assert response.status_code == 200
    assert response.json() == {
        "isbn": "BK-1001",
        "title": "The Glass Orchard",
        "author": "Mira Sol",
        "available_copies": 4,
    }


def test_unknown_isbn_returns_not_found(client):
    assert client.get("/books/unknown").status_code == 404
