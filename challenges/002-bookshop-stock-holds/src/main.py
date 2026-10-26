import json
from pathlib import Path

from fastapi import FastAPI, HTTPException


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "books.json"
BOOKS = json.loads(DATA_PATH.read_text())
app = FastAPI(title="Bookshop Catalogue")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/books")
def list_books():
    return BOOKS


@app.get("/books/{isbn}")
def get_book(isbn: str):
    for book in BOOKS:
        if book["isbn"] == isbn:
            return book
    raise HTTPException(status_code=404, detail="Book not found")
