import sqlite3
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import pytest
from fastapi.testclient import TestClient

import db.books as database
import src.main as main


def test_valid_hold_reduces_available_copies_and_is_recorded(client, db_path):
    response = client.post("/holds", json={"isbn": "BK-1001", "qt": 2})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert client.get("/books/BK-1001").json() == {
        "isbn": "BK-1001",
        "title": "The Glass Orchard",
        "author": "Mira Sol",
        "available_copies": 2,
    }
    with sqlite3.connect(db_path) as connection:
        assert connection.execute(
            "SELECT on_hold FROM books WHERE isbn = ?", ("BK-1001",)
        ).fetchone() == (2,)


def test_successive_holds_accumulate(client, db_path):
    client.post("/holds", json={"isbn": "BK-1001", "qt": 2})
    response = client.post("/holds", json={"isbn": "BK-1001", "qt": 1})

    assert response.status_code == 200
    assert client.get("/books/BK-1001").json()["available_copies"] == 1
    with sqlite3.connect(db_path) as connection:
        assert connection.execute(
            "SELECT on_hold FROM books WHERE isbn = ?", ("BK-1001",)
        ).fetchone() == (3,)


def test_unknown_isbn_returns_not_found(client):
    response = client.post("/holds", json={"isbn": "missing", "qt": 1})

    assert response.status_code == 404


@pytest.mark.parametrize("quantity", [0, -1, True, False, 1.5, "not-a-number"])
def test_invalid_quantity_returns_unprocessable_entity(client, db_path, quantity):
    response = client.post("/holds", json={"isbn": "BK-1001", "qt": quantity})

    assert response.status_code == 422
    with sqlite3.connect(db_path) as connection:
        assert connection.execute(
            "SELECT available_copies, on_hold FROM books WHERE isbn = ?",
            ("BK-1001",),
        ).fetchone() == (4, 0)


def test_insufficient_inventory_does_not_change_book_or_hold(client, db_path):
    response = client.post("/holds", json={"isbn": "BK-1001", "qt": 5})

    assert response.status_code == 409
    assert client.get("/books/BK-1001").json()["available_copies"] == 4
    with sqlite3.connect(db_path) as connection:
        assert connection.execute(
            "SELECT available_copies, on_hold FROM books WHERE isbn = ?",
            ("BK-1001",),
        ).fetchone() == (4, 0)


def test_concurrent_holds_do_not_oversell(db_path, monkeypatch):
    barrier = Barrier(2)
    get_book = main.get_book

    def read_before_both_updates(isbn):
        book = get_book(isbn)
        barrier.wait(timeout=5)
        return book

    monkeypatch.setattr(main, "get_book", read_before_both_updates)

    def place_hold(_):
        with TestClient(main.app) as concurrent_client:
            return concurrent_client.post("/holds", json={"isbn": "BK-1001", "qt": 3})

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(place_hold, range(2)))

    assert sorted(response.status_code for response in responses) == [200, 409]
    with sqlite3.connect(db_path) as connection:
        assert connection.execute(
            "SELECT available_copies, on_hold FROM books WHERE isbn = ?",
            ("BK-1001",),
        ).fetchone() == (1, 3)


def test_hold_and_catalogue_survive_database_reinitialization(client, db_path):
    response = client.post("/holds", json={"isbn": "BK-1001", "qt": 2})
    assert response.status_code == 200

    database.initialize_database()

    assert len(client.get("/books").json()) == 3
    assert client.get("/books/BK-1001").json()["available_copies"] == 2
    with sqlite3.connect(db_path) as connection:
        assert connection.execute(
            "SELECT available_copies, on_hold FROM books WHERE isbn = ?",
            ("BK-1001",),
        ).fetchone() == (2, 2)
