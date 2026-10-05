"""
Integration & End-to-End API Route Tests
Tests the full request lifecycle from REST client to database and prediction engine.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.database import db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_clean_seed():
    """Ensure database has clean demo data for test predictability."""
    db.seed_database()


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "storage_mode" in data


def test_auth_login_success():
    res = client.post("/api/auth/login", json={
        "username": "admin@inventory.io",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["role"] == "Admin"


def test_auth_login_invalid():
    res = client.post("/api/auth/login", json={
        "username": "admin@inventory.io",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401


def test_products_list_and_search():
    res = client.get("/api/products")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["count"] >= 15

    # Filter search
    search_res = client.get("/api/products?search=Gateway")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert any("Gateway" in p["name"] for p in search_data["data"])


def test_purchase_and_stock_increase():
    # Fetch initial stock of PRD-1001
    prod_before = client.get("/api/products/PRD-1001").json()["data"]
    stock_before = prod_before["quantity"]

    # Record purchase of 25 units
    purchase_res = client.post("/api/purchases", json={
        "product_id": "PRD-1001",
        "supplier_id": "SUP-001",
        "quantity": 25,
        "unit_cost": 150.00
    })
    assert purchase_res.status_code == 201
    purchase_data = purchase_res.json()
    assert purchase_data["success"] is True

    # Verify stock increased
    prod_after = client.get("/api/products/PRD-1001").json()["data"]
    assert prod_after["quantity"] == stock_before + 25


def test_sale_and_stock_decrease():
    # Fetch stock of PRD-1002
    prod_before = client.get("/api/products/PRD-1002").json()["data"]
    stock_before = prod_before["quantity"]

    # Sell 10 units
    sale_res = client.post("/api/sales", json={
        "product_id": "PRD-1002",
        "quantity": 10,
        "unit_price": 45.00
    })
    assert sale_res.status_code == 201

    # Verify stock decreased
    prod_after = client.get("/api/products/PRD-1002").json()["data"]
    assert prod_after["quantity"] == stock_before - 10


def test_oversale_rejection():
    # PRD-1003 is OUT OF STOCK (0 units)
    res = client.post("/api/sales", json={
        "product_id": "PRD-1003",
        "quantity": 1,
        "unit_price": 189.50
    })
    assert res.status_code == 400
    assert "Insufficient stock" in res.json()["detail"]


def test_alerts_endpoint():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["critical_count"] >= 1  # Out of stock products exist
    assert data["warning_count"] >= 1   # Low stock products exist


def test_prediction_calculation_endpoint():
    res = client.post("/api/predictions/calculate", json={
        "product_id": "PRD-1001",
        "method": "exponential_smoothing",
        "forecast_days": 30,
        "lead_time_days": 7
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["predicted_demand"] > 0
    assert "recommended_restock" in data
    assert "urgency_status" in data


def test_report_export_csv():
    res = client.get("/api/reports/export?report_type=inventory&format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Product ID,Product Name" in res.text
