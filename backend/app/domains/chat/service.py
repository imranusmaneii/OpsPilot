import uuid
import time
import json
import asyncio
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging_config import logger
from app.domains.chat.models import Conversation, Message


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_conversation(self, user_id: str, title: str | None = None) -> Conversation:
        conversation = Conversation(
            user_id=uuid.UUID(user_id),
            title=title or "New Conversation",
        )
        self.db.add(conversation)
        await self.db.flush()
        await self.db.refresh(conversation)
        return conversation

    async def list_conversations(self, user_id: str) -> list[Conversation]:
        result = await self.db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_conversation(self, user_id: str, conversation_id: str) -> Conversation:
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            from app.core.exceptions import NotFoundException
            raise NotFoundException("Conversation", conversation_id)
        return conv

    async def get_messages(self, conversation_id: str) -> list[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        )
        return list(result.scalars().all())

    async def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        model: str | None = None,
        token_count: int | None = None,
        latency_ms: float | None = None,
        metadata: dict | None = None,
    ) -> Message:
        message = Message(
            conversation_id=uuid.UUID(conversation_id),
            role=role,
            content=content,
            model=model,
            token_count=token_count,
            latency_ms=latency_ms,
            metadata_=metadata or {},
        )
        self.db.add(message)
        await self.db.flush()
        await self.db.refresh(message)
        return message

    async def delete_conversation(self, user_id: str, conversation_id: str):
        conv = await self.get_conversation(user_id, conversation_id)
        await self.db.delete(conv)
        await self.db.flush()
