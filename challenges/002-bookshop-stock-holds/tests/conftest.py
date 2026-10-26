import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import db.books as database


_IMPORT_DATABASE_DIR = tempfile.TemporaryDirectory(prefix="bookshop-test-import-")
database.DATABASE_PATH = Path(_IMPORT_DATABASE_DIR.name) / "books.db"

from src.main import app  # noqa: E402


@pytest.fixture
def db_path(tmp_path, monkeypatch):
    path = tmp_path / "books.db"
    monkeypatch.setattr(database, "DATABASE_PATH", path)
    database.initialize_database()
    return path


@pytest.fixture
def client(db_path):
    with TestClient(app) as test_client:
        yield test_client
