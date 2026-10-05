# Cloud-Based Intelligent Inventory Management & Stock Prediction System

**Academic Project:** Integrated M.Tech in Software Engineering  
**Specialization:** Software Configuration Management, Cloud Computing & ML Engineering  
**Architecture:** Serverless AWS (Amplify, Cognito, API Gateway, Lambda, DynamoDB, S3, CloudWatch) & Local Zero-Cost Dev Mode  

---

## 1. Project Overview

This project is an enterprise-ready, serverless, cloud-native inventory management and intelligent replenishment system. Designed to bridge transactional record-keeping with proactive decision support, the system automates:
1. **Catalog & Vendor Management:** Centralized product records and supplier relationships.
2. **Transactional Integrity:** Real-time stock recalculation following strict domain invariants:
   $$\text{Current Stock} = \text{Previous Stock} + \text{Purchases} - \text{Sales}$$
3. **Over-Sale Guardrails:** Strictly prevents selling items beyond verified warehouse inventory.
4. **Automated Stockout Alerts:** Flags out-of-stock items and warns when $\text{Current Stock} \le \text{Minimum Stock Level}$.
5. **Intelligent Demand Forecasting (ML):** Analyzes historical sales time-series using statistical methods (**Single Exponential Smoothing**, **Weighted Moving Average**, **Simple Moving Average**).
6. **Optimized Restocking Recommendations:**
   $$\text{Recommended Restock} = \max(0, \text{Predicted Demand} + \text{Safety Stock} - \text{Current Stock})$$
7. **Audit Reporting & Data Exports:** Tabular exports (CSV/PDF) and optional Amazon S3 archival.
8. **Role-Based Access Control (RBAC):** Admin and Operations Staff profiles managed through Amazon Cognito or local authentication.

---

## 2. Technology Stack & AWS Cloud Services

```
[React 18 Dashboard] (AWS Amplify Hosting)
        |
   [HTTPS Auth] ----> [Amazon Cognito User Pool]
        |
  [REST API Calls]
        v
[Amazon API Gateway]
        v
[AWS Lambda (Python 3.14)] <---> [Amazon CloudWatch Logs]
        |
        +---> [Amazon DynamoDB (Inventory & Transactions Table)]
        +---> [Amazon S3 (CSV & PDF Reports)]
        +---> [Forecasting Engine (SMA, WMA, Exponential Smoothing)]
```

- **Frontend:** React 18, Vite, Custom CSS Design System, Lucide Icons.
- **Backend API:** Python 3.14, FastAPI, Uvicorn, Pydantic, Mangum.
- **Database:** Dual-mode storage — Amazon DynamoDB (AWS mode) / SQLite with 1:1 DynamoDB schema mapping (Local mode).
- **Security:** Amazon Cognito JWT verification, IAM least-privilege policies, CORS guards.
- **Testing:** Pytest 9.1.1 (22 automated unit, integration, and algorithmic test cases).

---

## 3. Repository Structure

```text
.
├── backend/                  # FastAPI REST API Backend
│   ├── app/
│   │   ├── auth.py           # JWT & Cognito authentication layer
│   │   ├── config.py         # App configuration & environment settings
│   │   ├── database.py       # Dual-mode DB engine (SQLite / DynamoDB)
│   │   ├── domain.py         # Inventory domain math & validation rules
│   │   ├── main.py           # FastAPI application entrypoint
│   │   ├── models.py         # Pydantic schemas
│   │   └── routers/          # API route controllers
│   │       ├── auth.py
│   │       ├── products.py
│   │       ├── suppliers.py
│   │       ├── purchases.py
│   │       ├── sales.py
│   │       ├── inventory.py
│   │       ├── predictions.py
│   │       ├── reports.py
│   │       └── seed.py
│   └── data/                 # Local SQLite database & generated reports
├── ml/                       # Demand Forecasting Engine
│   └── forecaster.py         # SMA, WMA, Exponential Smoothing & Safety Stock
├── frontend/                 # Modern React Dashboard (Vite)
│   ├── src/
│   │   ├── api.js            # Frontend REST client
│   │   ├── index.css         # Modern dark/light design system
│   │   ├── App.jsx           # Master layout & state coordinator
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── Navbar.jsx
│   │       ├── LoginModal.jsx
│   │       └── views/        # Dashboard, Inventory, Products, Sales, etc.
│   └── package.json
├── lambda/                   # Standalone AWS Lambda Deployment Handlers
│   └── lambda_handler.py     # Mangum ASGI adapter for API Gateway
├── infrastructure/           # CloudFormation / AWS SAM Template
│   └── template.yaml         # DynamoDB, Cognito, S3, Lambda, API Gateway
├── tests/                    # Automated Test Suite (Pytest)
│   ├── test_inventory_math.py
│   ├── test_prediction.py
│   └── test_api_endpoints.py
├── docs/                     # Academic Documentation
├── PROJECT_PLAN.md           # Engineering specifications & requirements
├── ARCHITECTURE.md           # Cloud architecture & data flows
├── DATABASE_DESIGN.md        # DynamoDB single-table schema & query patterns
├── API_DOCUMENTATION.md      # REST endpoints & payload formats
├── TESTING.md                # 22 test cases and test strategy
├── DEPLOYMENT.md             # AWS Amplify, Lambda, Cognito deployment guide
├── COST_AND_FREE_TIER.md     # Free Tier protection & cost avoidance guide
├── SPRINT_PLAN.md            # Agile Scrum sprint breakdown
├── .env.example              # Template environment configuration
└── .gitignore
```

---

## 4. How to Run Locally (Zero Cost)

### Step 1: Start Backend API
Open a terminal in the project root:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The API is now live at `http://127.0.0.1:8000`. Interactive Swagger docs are accessible at `http://127.0.0.1:8000/docs`.*

### Step 2: Start React Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
*The React Dashboard is now accessible at `http://localhost:5173`.*

### Step 3: Default Demo Credentials
- **Administrator:** `admin@inventory.io` | `Password123!`
- **Operations Staff:** `staff@inventory.io` | `Password123!`
*(One-click demo buttons are provided on the login screen).*

---

## 5. Automated Test Suite

Execute all 22 automated test cases covering domain math, algorithm accuracy, and API endpoints:
```bash
pytest tests/ -v
```

Output:
```text
tests/test_api_endpoints.py::test_health_endpoint PASSED
tests/test_api_endpoints.py::test_auth_login_success PASSED
tests/test_api_endpoints.py::test_products_list_and_search PASSED
tests/test_api_endpoints.py::test_purchase_and_stock_increase PASSED
tests/test_api_endpoints.py::test_sale_and_stock_decrease PASSED
tests/test_api_endpoints.py::test_oversale_rejection PASSED
tests/test_api_endpoints.py::test_alerts_endpoint PASSED
tests/test_api_endpoints.py::test_prediction_calculation_endpoint PASSED
tests/test_api_endpoints.py::test_report_export_csv PASSED
tests/test_inventory_math.py::test_mandatory_purchase_case PASSED
tests/test_inventory_math.py::test_mandatory_sale_case PASSED
tests/test_inventory_math.py::test_mandatory_low_stock_case PASSED
tests/test_inventory_math.py::test_mandatory_out_of_stock_case PASSED
tests/test_inventory_math.py::test_mandatory_in_stock_case PASSED
tests/test_inventory_math.py::test_mandatory_over_sale_rejection PASSED
tests/test_prediction.py::test_simple_moving_average PASSED
tests/test_prediction.py::test_weighted_moving_average PASSED
tests/test_prediction.py::test_exponential_smoothing PASSED
tests/test_prediction.py::test_restock_formula_from_specification PASSED
tests/test_prediction.py::test_generate_recommendation_pipeline PASSED
===================== 22 passed in 1.14s =====================
```

---

## 6. Faculty Demonstration Procedure (10-Minute Walkthrough)

1. **System Health & Architecture:**
   - Open `http://127.0.0.1:8000/api/health` in browser to show API status.
   - Explain serverless architecture: React $\rightarrow$ Cognito $\rightarrow$ API Gateway $\rightarrow$ Lambda $\rightarrow$ DynamoDB $\rightarrow$ S3.
2. **Login & RBAC:**
   - Log in as **Administrator** using one-click login. Point out role indicator in sidebar.
3. **Executive Dashboard:**
   - Review KPI metric cards (Total Products, Physical Stock, Inventory Value, Low-Stock items, Out-of-Stock items).
4. **Mandatory Invariant Test: Inbound Purchase:**
   - Navigate to **Purchases** $\rightarrow$ Click **Record New Purchase**.
   - Select `Industrial IoT Gateway Hub` (Stock: 14) $\rightarrow$ Purchase 25 units.
   - Show live formula preview: $14 + 25 = 39$ units.
   - Submit and verify stock balance immediately increases to 39 in the catalog.
5. **Mandatory Invariant Test: Outbound Sale & Guardrail:**
   - Navigate to **Sales** $\rightarrow$ Click **Record Customer Sale**.
   - Attempt to sell 999 units of a product $\rightarrow$ Show the **Insufficient Stock Guardrail** red warning and disabled button.
   - Record a valid sale of 5 units $\rightarrow$ Submit and verify stock decreases.
6. **Low-Stock Alerting:**
   - Navigate to **Alerts**. Show critical alert for `Ultra-High Pressure Hydraulic Valve` (0 stock) and warning alerts for items $\le$ minimum stock.
7. **Intelligent Demand Prediction:**
   - Navigate to **Demand Forecasting**.
   - Select a product with sales history and choose **Single Exponential Smoothing (SES)**.
   - Click **Run Demand Forecast**.
   - Explain the result cards: Daily Demand Rate, Projected Demand, Safety Stock Buffer, and Recommended Restock quantity.
   - Show the step-by-step formula breakdown.
8. **Restocking Reorder Sheet:**
   - Navigate to **Restock Orders**. Show the prioritized replenishment list sorted by urgency.
9. **Audit Reports:**
   - Navigate to **Audit Reports** $\rightarrow$ Click **Download CSV Export** for Inventory Valuation. Open CSV file to verify structure.
10. **Cloud Cost Control:**
    - Open [COST_AND_FREE_TIER.md](file:///d:/1-fall%2026-27/software%20configuration%20management/scm%20test%20tasks/COST_AND_FREE_TIER.md) and highlight how the architecture stays 100% within the AWS Free Tier.
