from __future__ import annotations

from typing import Iterable

import httpx

from app.core.config import get_settings


class LLMServiceError(Exception):
    pass


def _normalize_message_content(content: object) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(str(item.get("text", "")))
        return "\n".join(part for part in parts if part)
    return str(content)


async def generate_assistant_reply(messages: Iterable[dict[str, str]]) -> tuple[str, str]:
    settings = get_settings()
    if not settings.llm_configured:
        raise LLMServiceError("LLM configuration is missing")

    url = f"{settings.llm_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.llm_model,
        "messages": list(messages),
        "temperature": 0.5,
    }
    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:300]
        raise LLMServiceError(f"Upstream LLM request failed: {detail}") from exc
    except httpx.HTTPError as exc:
        raise LLMServiceError("Unable to reach upstream LLM service") from exc

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise LLMServiceError("Upstream LLM response contained no choices")

    content = _normalize_message_content(choices[0].get("message", {}).get("content", ""))
    if not content.strip():
        raise LLMServiceError("Upstream LLM returned an empty message")
    return content.strip(), settings.llm_model
