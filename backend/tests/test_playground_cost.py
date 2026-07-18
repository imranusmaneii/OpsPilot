import pytest


class TestPlaygroundSchemas:
    def test_playground_request(self):
        from app.domains.playground import PlaygroundRequest

        req = PlaygroundRequest(prompt="Hello", system_prompt="Be helpful", model="gpt-4o")
        assert req.prompt == "Hello"
        assert req.model == "gpt-4o"
        assert req.temperature == 0.7

    def test_playground_request_defaults(self):
        from app.domains.playground import PlaygroundRequest

        req = PlaygroundRequest(prompt="Test")
        assert req.system_prompt == ""
        assert req.model == "gpt-4o-mini"
        assert req.max_tokens == 2048


class TestCostSchemas:
    def test_cost_estimate_request(self):
        from app.domains.cost import CostEstimateRequest

        req = CostEstimateRequest(model="gpt-4o", input_tokens=1000, output_tokens=500)
        assert req.model == "gpt-4o"
        assert req.input_tokens == 1000

    def test_model_pricing_response(self):
        from app.domains.cost import ModelPricingResponse

        resp = ModelPricingResponse(model="gpt-4o", input_per_million=2.50, output_per_million=10.00)
        assert resp.input_per_million == 2.50


class TestCostCalculations:
    def test_cost_calculation(self):
        input_tokens = 1_000_000
        output_tokens = 500_000
        input_price = 2.50
        output_price = 10.00
        input_cost = (input_tokens / 1_000_000) * input_price
        output_cost = (output_tokens / 1_000_000) * output_price
        assert input_cost == 2.50
        assert output_cost == 5.00
        assert input_cost + output_cost == 7.50

    def test_embedding_cost(self):
        tokens = 1_000_000
        price = 0.02
        cost = (tokens / 1_000_000) * price
        assert cost == 0.02
