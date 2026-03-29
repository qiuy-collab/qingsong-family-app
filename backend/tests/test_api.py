from __future__ import annotations


def test_auth_and_me(client, auth_headers):
    me_response = client.get("/api/v1/me", headers=auth_headers)
    assert me_response.status_code == 200
    payload = me_response.json()
    assert payload["full_name"] in {"张女士", "家属用户"}
    assert payload["default_elder_id"] == "e1234567-e89b-12d3-a456-426614174000"


def test_institutions_endpoints(client, auth_headers):
    response = client.get("/api/v1/institutions", headers=auth_headers)
    assert response.status_code == 200
    institutions = response.json()
    assert len(institutions) >= 3
    detail_response = client.get(f"/api/v1/institutions/{institutions[0]['id']}", headers=auth_headers)
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["services"]
    assert detail["reviews"]


def test_health_endpoints(client, auth_headers):
    elder_id = "e1234567-e89b-12d3-a456-426614174000"
    summary_response = client.get(f"/api/v1/elders/{elder_id}/health/summary", headers=auth_headers)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["average_bpm"] > 0
    metrics_response = client.get(
        f"/api/v1/elders/{elder_id}/health/metrics",
        params={"range": "7d"},
        headers=auth_headers,
    )
    assert metrics_response.status_code == 200
    metrics = metrics_response.json()
    assert len(metrics["points"]) >= 7


def test_dynamics_endpoints(client, auth_headers):
    elder_id = "e1234567-e89b-12d3-a456-426614174000"
    list_response = client.get(f"/api/v1/elders/{elder_id}/dynamics", headers=auth_headers)
    assert list_response.status_code == 200
    dynamics = list_response.json()
    assert dynamics
    dynamic_id = dynamics[0]["id"]

    like_response = client.post(f"/api/v1/dynamics/{dynamic_id}/like", headers=auth_headers)
    assert like_response.status_code == 200
    assert "likes" in like_response.json()

    comment_response = client.post(
        f"/api/v1/dynamics/{dynamic_id}/comments",
        json={"content": "测试评论"},
        headers=auth_headers,
    )
    assert comment_response.status_code == 201
    assert comment_response.json()["text"] == "测试评论"


def test_service_logs_endpoint(client, auth_headers):
    elder_id = "e1234567-e89b-12d3-a456-426614174000"
    response = client.get(
        f"/api/v1/elders/{elder_id}/service-logs",
        params={"day_index": 0},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_orders_endpoints(client, auth_headers):
    response = client.get("/api/v1/orders", headers=auth_headers)
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) >= 2

    sign_response = client.post(
        "/api/v1/orders/sign",
        json={
            "institution_id": "inst-1",
            "elder_id": "e1234567-e89b-12d3-a456-426614174000",
            "name": "张女士",
            "id_number": "110101199001011234",
            "phone": "13800138000",
            "relationship": "女儿",
            "is_pro_package": True,
            "photo": "data:image/png;base64,photo",
            "signature_data": "data:image/png;base64,signature",
        },
        headers=auth_headers,
    )
    assert sign_response.status_code == 201
    signed_order = sign_response.json()

    review_response = client.post(
        f"/api/v1/orders/{signed_order['id']}/reviews",
        json={"rating": 5, "comment": "测试评价"},
        headers=auth_headers,
    )
    assert review_response.status_code == 201


def test_assistant_endpoints(client, auth_headers, monkeypatch):
    async def fake_reply(messages):
        assert messages[-1]["role"] == "user"
        return "这是松小暖的测试回复。", "GLM-5"

    monkeypatch.setattr("app.api.routes.assistant.generate_assistant_reply", fake_reply)

    create_response = client.post("/api/v1/assistant/sessions", headers=auth_headers)
    assert create_response.status_code == 201
    payload = create_response.json()
    session_id = payload["session"]["id"]
    assert payload["messages"]

    session_response = client.get(f"/api/v1/assistant/sessions/{session_id}", headers=auth_headers)
    assert session_response.status_code == 200

    history_response = client.get(f"/api/v1/assistant/sessions/{session_id}/messages", headers=auth_headers)
    assert history_response.status_code == 200
    assert len(history_response.json()) >= 1

    message_response = client.post(
        f"/api/v1/assistant/sessions/{session_id}/messages",
        json={"content": "请介绍一下 App 的功能"},
        headers=auth_headers,
    )
    assert message_response.status_code == 201
    assert message_response.json()["content"] == "这是松小暖的测试回复。"
