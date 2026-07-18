import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime


class TestEvaluationSchemas:
    def test_evaluation_create(self):
        from app.domains.evaluation.schemas import EvaluationCreate

        data = EvaluationCreate(
            name="Test Eval",
            dataset=[{"question": "What is AI?", "context": "...", "expected": "..."}],
            model="gpt-4o-mini",
        )
        assert data.name == "Test Eval"
        assert len(data.dataset) == 1

    def test_evaluation_list_response(self):
        from app.domains.evaluation.schemas import EvaluationListResponse, EvaluationResponse

        resp = EvaluationListResponse(
            evaluations=[
                EvaluationResponse(
                    id="00000000-0000-0000-0000-000000000001",
                    name="Eval 1",
                    model="gpt-4o-mini",
                    status="completed",
                    avg_score=0.85,
                    created_at=datetime.now(),
                )
            ],
            total=1,
        )
        assert resp.total == 1


class TestAnalyticsSchemas:
    def test_overview_response(self):
        from app.domains.analytics.schemas import OverviewResponse

        resp = OverviewResponse(
            total_documents=100,
            total_collections=5,
            total_queries=1000,
            avg_confidence=0.87,
            storage_used_mb=256.5,
        )
        assert resp.total_documents == 100
        assert resp.avg_confidence == 0.87
