from fastapi.testclient import TestClient

from app.main import app


def test_healthz() -> None:
    with TestClient(app) as client:
        res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_docs_served_under_prefix() -> None:
    with TestClient(app) as client:
        assert client.get("/api/py/openapi.json").status_code == 200
