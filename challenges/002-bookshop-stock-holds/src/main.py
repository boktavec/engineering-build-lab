import sqlite3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from db.books import get_connection, initialize_database

initialize_database()


class BookRequest(BaseModel):
    isbn: str
    qt: int = Field(strict=True)


app = FastAPI(title="Bookshop Catalogue")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/books")
def list_books():
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    try:
        query = cur.execute("SELECT isbn, title, author, available_copies from books")

        books_rows = query.fetchall()
        books = [dict(book) for book in books_rows]
        return books

    finally:
        con.close()


@app.get("/books/{isbn}")
def get_book(isbn: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    try:
        query = cur.execute("SELECT isbn, title, author, available_copies from books where isbn = ?", (isbn,))
        book = query.fetchone()
        if book is None:
            raise HTTPException(status_code=404, detail="Book not found")

        book = dict(book)
        return book
    finally:
        con.close()

@app.post("/holds")
def hold_books(request: BookRequest):
    body = request.model_dump()
    isbn = body["isbn"]
    get_book(isbn)

    quantity = body["qt"]

    if quantity <= 0:
        raise HTTPException(status_code=422, detail="invalid quantity")

    con = get_connection()
    cur = con.cursor()

    try:
        cur.execute("UPDATE books SET available_copies = available_copies - ?, on_hold = on_hold + ? where isbn = ? and available_copies >= ?", (quantity, quantity, isbn, quantity))
        if cur.rowcount == 0:
            raise HTTPException(status_code=409, detail="Insufficient stock")
        con.commit()
    finally:
        con.close()

    return {"status": "ok"}
