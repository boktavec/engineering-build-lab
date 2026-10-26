import json
import sqlite3
from pathlib import Path


DATABASE_PATH = Path(__file__).resolve().with_name("books.db")
BOOKS_PATH = Path(__file__).resolve().parents[1] / "data" / "books.json"
BOOKS = [
    (book["isbn"], book["title"], book["author"], book["available_copies"])
    for book in json.loads(BOOKS_PATH.read_text())
]


def get_connection():
    return sqlite3.connect(DATABASE_PATH)


def initialize_database():
    connection = get_connection()
    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY,
                isbn TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                available_copies INTEGER NOT NULL,
                on_hold INTEGER NOT NULL
            )
        """)
        connection.executemany(
            "INSERT OR IGNORE INTO books "
            "(isbn, title, author, available_copies, on_hold) "
            "VALUES (?, ?, ?, ?, 0)",
            BOOKS,
        )
        connection.commit()
    finally:
        connection.close()
