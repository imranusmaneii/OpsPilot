import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import get_current_user_id
from app.core.logging_config import logger

router = APIRouter(prefix="/cost", tags=["Cost Estimator"])

MODEL_PRICING = {
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "claude-3.5-sonnet": {"input": 3.00, "output": 15.00},
    "claude-3-haiku": {"input": 0.25, "output": 1.25},
    "text-embedding-3-small": {"input": 0.02, "output": 0.0},
    "text-embedding-3-large": {"input": 0.13, "output": 0.0},
}


class CostEstimateRequest(BaseModel):
    model: str
    input_tokens: int
    output_tokens: int


class ModelPricingResponse(BaseModel):
    model: str
    input_per_million: float
    output_per_million: float


@router.get("/models", response_model=list[ModelPricingResponse])
async def list_model_pricing(user_id: uuid.UUID = Depends(get_current_user_id)):
    return [
        ModelPricingResponse(
            model=name,
            input_per_million=prices["input"],
            output_per_million=prices["output"],
        )
        for name, prices in MODEL_PRICING.items()
    ]


@router.post("/estimate")
async def estimate_cost(
    data: CostEstimateRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    pricing = MODEL_PRICING.get(data.model, {"input": 0.0, "output": 0.0})
    input_cost = (data.input_tokens / 1_000_000) * pricing["input"]
    output_cost = (data.output_tokens / 1_000_000) * pricing["output"]
    return {
        "model": data.model,
        "input_cost": round(input_cost, 6),
        "output_cost": round(output_cost, 6),
        "total_cost": round(input_cost + output_cost, 6),
    }


@router.post("/batch")
async def batch_cost_estimate(
    items: list[CostEstimateRequest],
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    results = []
    total = 0.0
    for item in items:
        pricing = MODEL_PRICING.get(item.model, {"input": 0.0, "output": 0.0})
        input_cost = (item.input_tokens / 1_000_000) * pricing["input"]
        output_cost = (item.output_tokens / 1_000_000) * pricing["output"]
        item_total = round(input_cost + output_cost, 6)
        total += item_total
        results.append({"model": item.model, "cost": item_total})
    return {"items": results, "total_cost": round(total, 6)}
