import json
import sqlite3
from contextlib import closing

import db.books as database


def test_initializer_loads_json_fixture_and_is_idempotent(db_path):
    expected = sorted(
        (
            book["isbn"],
            book["title"],
            book["author"],
            book["available_copies"],
            0,
        )
        for book in json.loads(database.BOOKS_PATH.read_text())
    )

    with closing(sqlite3.connect(db_path)) as connection:
        actual = connection.execute(
            "SELECT isbn, title, author, available_copies, on_hold "
            "FROM books ORDER BY isbn"
        ).fetchall()
    assert actual == expected

    database.initialize_database()

    with closing(sqlite3.connect(db_path)) as connection:
        assert connection.execute("SELECT COUNT(*) FROM books").fetchone() == (
            len(expected),
        )
