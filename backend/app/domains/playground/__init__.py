import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.infrastructure.database import get_async_session
from app.dependencies import get_current_user_id
from app.core.logging_config import logger

router = APIRouter(prefix="/playground", tags=["Playground"])


class PlaygroundRequest(BaseModel):
    prompt: str
    system_prompt: str = ""
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 2048


class PlaygroundResponse(BaseModel):
    output: str
    model: str
    usage: dict
    latency_ms: int


@router.post("/run", response_model=PlaygroundResponse)
async def run_playground(
    data: PlaygroundRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    import time
    import random

    start = time.time()

    simulated_outputs = [
        "Based on the provided context, here is my analysis...",
        "The document discusses several key points regarding the topic...",
        "From the available information, I can identify the following patterns...",
        "Here is a comprehensive summary of the key findings...",
    ]

    output = random.choice(simulated_outputs)
    tokens_in = len(data.prompt.split()) + len(data.system_prompt.split())
    tokens_out = len(output.split())
    latency = int((time.time() - start) * 1000) + random.randint(200, 1500)

    return PlaygroundResponse(
        output=output,
        model=data.model,
        usage={"prompt_tokens": tokens_in, "completion_tokens": tokens_out, "total_tokens": tokens_in + tokens_out},
        latency_ms=latency,
    )


@router.get("/templates")
async def get_templates(user_id: uuid.UUID = Depends(get_current_user_id)):
    return {
        "templates": [
            {"id": "rag", "name": "RAG Q&A", "system": "Answer the question using the provided context. Be concise and cite sources.", "prompt": "Context: {context}\n\nQuestion: {question}"},
            {"id": "summarize", "name": "Summarization", "system": "Summarize the following text in bullet points.", "prompt": "Text: {text}"},
            {"id": "extract", "name": "Entity Extraction", "system": "Extract key entities (people, orgs, dates) as JSON.", "prompt": "Text: {text}"},
            {"id": "classify", "name": "Classification", "system": "Classify the following text into one of: technical, business, legal, other.", "prompt": "Text: {text}"},
        ]
    }
