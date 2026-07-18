from datetime import datetime


class TestEvaluationSchemas:
    def test_evaluation_create(self):
        from app.domains.evaluation.schemas import EvaluationCreate

        data = EvaluationCreate(
            name="Test Eval",
            dataset=[{"question": "What is AI?", "context": "...", "ground_truth": "..."}],
            model="gpt-4o-mini",
        )
        assert data.name == "Test Eval"
        assert len(data.dataset) == 1
        assert data.dataset[0].ground_truth == "..."

    def test_evaluation_list_response(self):
        from app.domains.evaluation.schemas import EvaluationListResponse, EvaluationResponse

        resp = EvaluationListResponse(
            evaluations=[
                EvaluationResponse(
                    id="00000000-0000-0000-0000-000000000001",
                    name="Eval 1",
                    model="gpt-4o-mini",
                    status="completed",
                    total_samples=10,
                    created_at=datetime.now(),
                )
            ],
            total=1,
        )
        assert resp.total == 1
        assert resp.evaluations[0].total_samples == 10

    def test_eval_dataset_item(self):
        from app.domains.evaluation.schemas import EvalDatasetItem

        item = EvalDatasetItem(question="What is ML?", ground_truth="Machine learning is...")
        assert item.question == "What is ML?"
        assert item.context is None

    def test_evaluation_result_response(self):
        from app.domains.evaluation.schemas import EvaluationResultResponse

        resp = EvaluationResultResponse(
            id="00000000-0000-0000-0000-000000000001",
            question="What is AI?",
            answer="AI is...",
            faithfulness=0.9,
            answer_relevancy=0.85,
        )
        assert resp.faithfulness == 0.9

    def test_regression_point(self):
        from app.domains.evaluation.schemas import RegressionPoint

        point = RegressionPoint(
            evaluation_id="00000000-0000-0000-0000-000000000001",
            name="Eval v1",
            created_at=datetime.now(),
            faithfulness=0.88,
        )
        assert point.faithfulness == 0.88
