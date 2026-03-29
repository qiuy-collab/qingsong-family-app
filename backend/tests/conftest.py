from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import SessionLocal, engine
from app.main import app
from app.services.seed import seed_demo_data


@pytest.fixture(scope="session", autouse=True)
def prepare_database():
    settings = get_settings()
    with engine.begin() as connection:
        connection.execute(text("SELECT 1"))
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    return settings


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/demo-login",
        json={"phone": "13800138000", "verification_code": "123456"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
