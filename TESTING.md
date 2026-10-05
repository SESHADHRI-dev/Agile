# Testing Strategy & Automated Test Suite

**Project:** Cloud-Based Intelligent Inventory Management & Stock Prediction System  
**Academic Degree:** Integrated M.Tech Software Engineering  
**Test Framework:** Pytest 9.1.1, FastAPI TestClient (HTTPX)  

---

## 1. Testing Strategy Overview

The testing architecture follows the classic software engineering **Test Pyramid**:
1. **Domain Unit Tests (`tests/test_inventory_math.py`):** Isolates critical inventory invariants and mathematical calculations without network or database overhead.
2. **Algorithm & ML Tests (`tests/test_prediction.py`):** Validates the accuracy, boundaries, and mathematical correctness of demand forecasting algorithms (SMA, WMA, SES) and the restocking equation.
3. **API Integration Tests (`tests/test_api_endpoints.py`):** Exercises the entire request-response cycle across FastAPI routers, database reads/writes, transactional stock mutations, and error handling.

---

## 2. Mandatory Test Cases from Specification

The table below outlines the core test scenarios mandated by the project requirements:

| # | Test Scenario | Input Conditions | Expected Result | Implemented In | Status |
| :- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Purchase Stock Increase** | Previous Stock = 100, Purchase Qty = 50 | Stock increases to **150** units | `test_inventory_math.py::test_mandatory_purchase_case` | **PASSED** |
| **TC-02** | **Sale Stock Decrease** | Previous Stock = 150, Sale Qty = 30 | Stock decreases to **120** units | `test_inventory_math.py::test_mandatory_sale_case` | **PASSED** |
| **TC-03** | **Low-Stock Detection** | Current Stock = 10, Min Stock = 20 | Status evaluated as **`LOW STOCK`** | `test_inventory_math.py::test_mandatory_low_stock_case` | **PASSED** |
| **TC-04** | **Out-of-Stock Detection**| Current Stock = 0, Min Stock = 20 | Status evaluated as **`OUT OF STOCK`** | `test_inventory_math.py::test_mandatory_out_of_stock_case` | **PASSED** |
| **TC-05** | **Over-Sale Rejection** | Current Stock = 10, Sale Qty = 15 | **REJECTED** with HTTP 400 (`Insufficient stock`) | `test_inventory_math.py::test_mandatory_over_sale_rejection` | **PASSED** |
| **TC-06** | **Negative Purchase Qty** | Purchase Qty = -5 | **REJECTED** with ValueError | `test_inventory_math.py::test_invalid_negative_quantities` | **PASSED** |
| **TC-07** | **Zero/Negative Sale Qty**| Sale Qty = 0 | **REJECTED** with ValueError | `test_inventory_math.py::test_invalid_negative_quantities` | **PASSED** |
| **TC-08** | **Specification Restock** | Demand = 120, Stock = 50, Safety = 20 | Recommended Restock = $120 + 20 - 50 = \mathbf{90}$ | `test_prediction.py::test_restock_formula_from_specification`| **PASSED** |
| **TC-09** | **SMA Calculation** | 7-day sales of 10 units each | Daily rate = **10.0** | `test_prediction.py::test_simple_moving_average` | **PASSED** |
| **TC-10** | **WMA Calculation** | Series [10, 20, 30], weights [1, 2, 3] | Daily rate = $\frac{10\times 1 + 20\times 2 + 30\times 3}{6} = \mathbf{23.33}$ | `test_prediction.py::test_weighted_moving_average` | **PASSED** |
| **TC-11** | **Exponential Smoothing**| Series [10, 20, 30], $\alpha = 0.5$ | Daily rate = **22.5** | `test_prediction.py::test_exponential_smoothing` | **PASSED** |
| **TC-12** | **End-to-End Prediction**| 30 days historical data, 25 stock | Produces positive restock & urgency | `test_prediction.py::test_generate_recommendation_pipeline` | **PASSED** |
| **TC-13** | **Health Endpoint** | `GET /api/health` | HTTP 200, status `healthy` | `test_api_endpoints.py::test_health_endpoint` | **PASSED** |
| **TC-14** | **Auth Login Success** | `admin@inventory.io` / `Password123!` | HTTP 200, JWT token returned | `test_api_endpoints.py::test_auth_login_success` | **PASSED** |
| **TC-15** | **Auth Login Invalid** | `admin@inventory.io` / wrong pass | HTTP 401 Unauthorized | `test_api_endpoints.py::test_auth_login_invalid` | **PASSED** |
| **TC-16** | **Product Search** | `GET /api/products?search=Gateway` | HTTP 200, filters items correctly | `test_api_endpoints.py::test_products_list_and_search` | **PASSED** |
| **TC-17** | **API Purchase Mutation**| `POST /api/purchases` (+25 units) | Stock updated from $X$ to $X+25$ | `test_api_endpoints.py::test_purchase_and_stock_increase` | **PASSED** |
| **TC-18** | **API Sale Mutation** | `POST /api/sales` (-10 units) | Stock updated from $X$ to $X-10$ | `test_api_endpoints.py::test_sale_and_stock_decrease` | **PASSED** |
| **TC-19** | **API Over-Sale Check** | `POST /api/sales` on 0 stock product | HTTP 400 Bad Request | `test_api_endpoints.py::test_oversale_rejection` | **PASSED** |
| **TC-20** | **Alerts Feed** | `GET /api/alerts` | HTTP 200, contains critical & warnings | `test_api_endpoints.py::test_alerts_endpoint` | **PASSED** |
| **TC-21** | **API ML Calculation** | `POST /api/predictions/calculate` | HTTP 200, outputs restock recommendation | `test_api_endpoints.py::test_prediction_calculation_endpoint`| **PASSED** |
| **TC-22** | **CSV Report Export** | `GET /api/reports/export?type=inventory`| HTTP 200, CSV header attached | `test_api_endpoints.py::test_report_export_csv` | **PASSED** |

---

## 3. How to Execute Tests

Run the full automated test suite using pytest:
```bash
pytest tests/ -v
```

To run a specific test category:
```bash
# Domain & Stock math tests
pytest tests/test_inventory_math.py -v

# Demand forecasting & ML tests
pytest tests/test_prediction.py -v

# REST API integration tests
pytest tests/test_api_endpoints.py -v
```
