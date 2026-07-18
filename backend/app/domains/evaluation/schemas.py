import uuid
from datetime import datetime
from pydantic import BaseModel


class EvalDatasetItem(BaseModel):
    question: str
    ground_truth: str
    context: str | None = None


class EvaluationCreate(BaseModel):
    name: str
    dataset: list[EvalDatasetItem]
    model: str | None = None


class EvaluationResponse(BaseModel):
    id: uuid.UUID
    name: str
    status: str
    metrics: dict | None = None
    model: str | None = None
    total_samples: int
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class EvaluationListResponse(BaseModel):
    evaluations: list[EvaluationResponse]
    total: int


class EvaluationResultResponse(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    context: str | None = None
    ground_truth: str | None = None
    faithfulness: float | None = None
    answer_relevancy: float | None = None
    context_precision: float | None = None
    context_recall: float | None = None
    hallucination_score: float | None = None
    latency_ms: float | None = None
    token_count: int | None = None
    cost_usd: float | None = None

    model_config = {"from_attributes": True}


class EvaluationDetailResponse(EvaluationResponse):
    results: list[EvaluationResultResponse] = []


class RegressionPoint(BaseModel):
    evaluation_id: uuid.UUID
    name: str
    created_at: datetime
    faithfulness: float | None = None
    answer_relevancy: float | None = None
    context_precision: float | None = None
    hallucination_score: float | None = None
