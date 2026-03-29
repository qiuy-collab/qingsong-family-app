from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.assistant import ChatMessage, ChatSession
from app.models.profile import Profile
from app.schemas.assistant import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreateResponse,
    ChatSessionResponse,
)
from app.services.llm import LLMServiceError, generate_assistant_reply


router = APIRouter()


def _session_or_404(db: Session, session_id: str, profile_id: str) -> ChatSession:
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.profile_id == profile_id).one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def _serialize_message(message: ChatMessage) -> ChatMessageResponse:
    return ChatMessageResponse(
        id=message.id,
        role=message.role,
        content=message.content,
        model_name=message.model_name,
        error_state=message.error_state,
        created_at=message.created_at.isoformat() if getattr(message, "created_at", None) else None,
    )


@router.post("/sessions", response_model=ChatSessionCreateResponse, status_code=status.HTTP_201_CREATED)
def create_session(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)) -> ChatSessionCreateResponse:
    session = ChatSession(profile_id=current_user.id, title="松小暖会话")
    db.add(session)
    db.flush()
    welcome = ChatMessage(
        session_id=session.id,
        role="assistant",
        content="你好，我是松小暖。你可以问我机构介绍、健康数据、服务日志或签约流程。",
        model_name="system",
    )
    db.add(welcome)
    db.commit()
    db.refresh(session)
    db.refresh(welcome)
    return ChatSessionCreateResponse(
        session=ChatSessionResponse(id=session.id, title=session.title, updated_at=session.updated_at.isoformat()),
        messages=[_serialize_message(welcome)],
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session(
    session_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatSessionResponse:
    session = _session_or_404(db, session_id, current_user.id)
    return ChatSessionResponse(id=session.id, title=session.title, updated_at=session.updated_at.isoformat())


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
def list_messages(
    session_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ChatMessageResponse]:
    session = _session_or_404(db, session_id, current_user.id)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [_serialize_message(message) for message in messages]


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    session_id: str,
    payload: ChatMessageCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatMessageResponse:
    session = _session_or_404(db, session_id, current_user.id)
    user_message = ChatMessage(session_id=session.id, role="user", content=payload.content)
    db.add(user_message)
    db.flush()

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    settings = get_settings()
    llm_messages = [{"role": "system", "content": settings.assistant_role_prompt}] + [
        {"role": item.role, "content": item.content}
        for item in history[-12:]
        if item.role in {"user", "assistant"}
    ]

    try:
        reply_text, model_name = await generate_assistant_reply(llm_messages)
    except LLMServiceError as exc:
        error_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content="抱歉，我刚刚没有连上服务，请稍后重试。",
            model_name=settings.llm_model,
            error_state=True,
        )
        db.add(error_message)
        db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=reply_text,
        model_name=model_name,
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    return _serialize_message(assistant_message)
