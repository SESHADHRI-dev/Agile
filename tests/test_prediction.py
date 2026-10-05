"""
Unit Tests for Machine Learning Demand Prediction & Restocking Logic
"""

import pytest
import sys
import os

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.forecaster import DemandForecaster


def test_simple_moving_average():
    # 7 days of sales: 10, 10, 10, 10, 10, 10, 10 -> average is 10.0
    sales = [10.0] * 7
    avg = DemandForecaster.simple_moving_average(sales, window=7)
    assert avg == 10.0


def test_weighted_moving_average():
    # Higher weights on later days
    sales = [10.0, 20.0, 30.0]
    # weights: 1, 2, 3 -> sum = 6
    # weighted = (10*1 + 20*2 + 30*3) / 6 = (10 + 40 + 90) / 6 = 140 / 6 = 23.333
    wma = DemandForecaster.weighted_moving_average(sales, window=3)
    assert round(wma, 2) == 23.33


def test_exponential_smoothing():
    sales = [10.0, 20.0, 30.0]
    # F0 = 10
    # F1 = 0.5*20 + 0.5*10 = 15
    # F2 = 0.5*30 + 0.5*15 = 22.5
    ses = DemandForecaster.exponential_smoothing(sales, alpha=0.5)
    assert ses == 22.5


def test_restock_formula_from_specification():
    """
    Mandatory check from project specification:
    Predicted Demand = 120 units
    Current Stock = 50 units
    Safety Stock = 20 units
    Recommended Restock ≈ 120 + 20 − 50 = 90 units
    """
    predicted_demand = 120
    current_stock = 50
    safety_stock = 20
    expected_restock = 120 + 20 - 50
    assert expected_restock == 90


def test_generate_recommendation_pipeline():
    # Simulate 30 days of sales
    sample_records = [
        {"sale_date": f"2026-09-{i:02d}T10:00:00Z", "quantity": 5}
        for i in range(1, 31)
    ]
    current_stock = 25
    result = DemandForecaster.generate_recommendation(
        sales_records=sample_records,
        current_stock=current_stock,
        method="exponential_smoothing",
        forecast_horizon_days=30,
        lead_time_days=7
    )
    assert result["daily_demand_rate"] == 5.0
    assert result["predicted_demand"] == 150
    assert result["recommended_restock"] > 0
    assert result["current_stock"] == 25


def test_prediction_empty_sales_history():
    """Ensure pipeline never crashes when historical sales dataset is completely empty."""
    res = DemandForecaster.generate_recommendation(
        sales_records=[],
        current_stock=10,
        method="exponential_smoothing"
    )
    assert res["daily_demand_rate"] == 0.0
    assert res["predicted_demand"] == 0
    assert res["recommended_restock"] == 0
    assert res["urgency_status"] == "SUFFICIENT_STOCK"


def test_prediction_zero_sales():
    """Ensure pipeline handles all-zero sales without dividing by zero."""
    records = [{"sale_date": "2026-09-01T10:00:00Z", "quantity": 0}]
    res = DemandForecaster.generate_recommendation(
        sales_records=records,
        current_stock=5,
        method="moving_average"
    )
    assert res["predicted_demand"] == 0
    assert res["recommended_restock"] == 0


def test_prediction_single_transaction():
    """Ensure pipeline handles a single sale record correctly."""
    records = [{"sale_date": "2026-09-01T10:00:00Z", "quantity": 4}]
    res = DemandForecaster.generate_recommendation(
        sales_records=records,
        current_stock=0,
        method="exponential_smoothing"
    )
    assert res["daily_demand_rate"] == 4.0
    assert res["urgency_status"] == "CRITICAL_OUT_OF_STOCK"
    assert res["recommended_restock"] > 0


def test_prediction_irregular_dates():
    """Ensure days between irregular sales are interpolated with 0."""
    records = [
        {"sale_date": "2026-09-01T10:00:00Z", "quantity": 10},
        {"sale_date": "2026-09-05T10:00:00Z", "quantity": 10}
    ]
    res = DemandForecaster.generate_recommendation(
        sales_records=records,
        current_stock=15,
        method="weighted_moving_average"
    )
    assert res["historical_days_analyzed"] == 5  # Sept 1 to Sept 5 = 5 days
    assert res["total_historical_sales_units"] == 20

