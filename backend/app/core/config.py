from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env.local", BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "https://qiuy-collab.github.io",
        ]
    )

    jwt_secret: str = "replace-me-in-env"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    database_url: str = "postgresql+psycopg://postgres@127.0.0.1:54329/qingsong_assistant"

    llm_provider_name: str = "baishan"
    llm_base_url: str = "https://api.edgefn.net/v1"
    llm_api_format: str = "openai"
    llm_api_key: str = ""
    llm_model: str = "GLM-5"
    llm_timeout_seconds: float = 30.0

    assistant_name: str = "松小暖"
    assistant_role_prompt: str = (
        "你是青松智陪家属端内的虚拟助手“松小暖”。"
        "你的回答要温暖、专业、简洁，优先帮助家属了解机构、健康数据、服务日志、订单进度和应用操作。"
        "如果问题超出已知数据，明确说明并给出下一步建议。"
    )

    demo_profile_id: str = "11111111-1111-1111-1111-111111111111"
    demo_elder_id: str = "e1234567-e89b-12d3-a456-426614174000"

    @property
    def llm_configured(self) -> bool:
        return bool(self.llm_api_key and self.llm_base_url and self.llm_model)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
