import json
import time

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db_session
from app.domains.chat.service import ChatService
from app.domains.chat.schemas import SearchRequest, SearchResponse
from app.domains.chat.service import SearchService

router = APIRouter(prefix="/chat", tags=["Chat"])


def get_chat_service(db: AsyncSession = Depends(get_db_session)) -> ChatService:
    return ChatService(db)


def get_search_service(db: AsyncSession = Depends(get_db_session)) -> SearchService:
    return SearchService(db)


@router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    user_id: str = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    return await service.search(request)


@router.post("/conversations", status_code=201)
async def create_conversation(
    user_id: str = Depends(get_current_user_id),
    service: ChatService = Depends(get_chat_service),
):
    conv = await service.create_conversation(user_id)
    return {"id": str(conv.id), "title": conv.title}


@router.get("/conversations")
async def list_conversations(
    user_id: str = Depends(get_current_user_id),
    service: ChatService = Depends(get_chat_service),
):
    convs = await service.list_conversations(user_id)
    return {
        "conversations": [
            {"id": str(c.id), "title": c.title, "created_at": c.created_at.isoformat()}
            for c in convs
        ]
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    service: ChatService = Depends(get_chat_service),
):
    await service.get_conversation(user_id, conversation_id)
    messages = await service.get_messages(conversation_id)
    return {
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
                "model": m.model,
                "latency_ms": m.latency_ms,
            }
            for m in messages
        ]
    }


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    service: ChatService = Depends(get_chat_service),
):
    await service.delete_conversation(user_id, conversation_id)


@router.post("/stream")
async def stream_chat(
    request: dict,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    message = request.get("message", "")
    conversation_id = request.get("conversation_id")

    chat_service = ChatService(db)
    search_service = SearchService(db)

    if not conversation_id:
        conv = await chat_service.create_conversation(user_id, title=message[:100])
        conversation_id = str(conv.id)

    await chat_service.save_message(conversation_id, "user", message)

    async def generate():
        start = time.perf_counter()

        search_results = await search_service.search(
            SearchRequest(query=message, top_k=5)
        )

        context_parts = []
        for r in search_results.results:
            source = f"[{r.document_title}"
            if r.page_number:
                source += f", p.{r.page_number}"
            source += "]"
            context_parts.append(f"{source}\n{r.content}")

        context = "\n\n".join(context_parts) if context_parts else "No relevant documents found."

        system_prompt = f"""You are OpsPilot AI, an intelligent enterprise AI operations assistant.
Answer the user's question based on the provided context.
Always cite your sources. Be precise and professional.

Context:
{context}"""

        full_response = ""
        token_count = 0

        try:
            from openai import AsyncOpenAI
            from app.config import settings

            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

            stream = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                stream=True,
                temperature=0.3,
                max_tokens=2000,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    token_count += 1
                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"

        except Exception as e:
            fallback = f"I'll answer based on the retrieved context.\n\n{context}\n\n**Query:** {message}"
            full_response = fallback
            yield f"data: {json.dumps({'type': 'content', 'content': fallback})}\n\n"

        latency_ms = (time.perf_counter() - start) * 1000

        sources = [
            {
                "title": r.document_title,
                "page": r.page_number,
                "content": r.content[:200],
                "score": r.rerank_score or r.similarity,
            }
            for r in search_results.results
        ]

        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        yield f"data: {json.dumps({'type': 'metadata', 'latency_ms': round(latency_ms, 2), 'token_count': token_count, 'model': settings.OPENAI_MODEL})}\n\n"
        yield "data: [DONE]\n\n"

        await chat_service.save_message(
            conversation_id,
            "assistant",
            full_response,
            model=settings.OPENAI_MODEL,
            token_count=token_count,
            latency_ms=latency_ms,
            metadata={"sources": sources},
        )

    return StreamingResponse(generate(), media_type="text/event-stream")
