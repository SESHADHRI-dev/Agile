# Project Plan: Cloud-Based Intelligent Inventory Management and Stock Prediction System

**Academic Degree:** Integrated M.Tech in Software Engineering  
**Course:** Software Configuration Management & Cloud Engineering  
**Project Status:** Active Development  

---

## 1. Project Overview
Modern supply chains require more than transactional ledger recording; they require predictive decision support to prevent stockouts and avoid capital lockup in excess inventory. 

This project delivers a complete, serverless, cloud-ready web application designed to:
1. Centrally manage catalog items (products), vendors (suppliers), and trade transactions (purchases and sales).
2. Maintain strict transactional integrity:
   $$\text{Current Stock} = \text{Previous Stock} + \text{Purchases} - \text{Sales}$$
3. Automate inventory status tracking (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`).
4. Generate intelligent demand forecasts and restocking recommendations using quantitative statistical methods.
5. Provide management reports with export capabilities (CSV, PDF, Amazon S3).
6. Enable secure remote role-based access control (Admin, Staff) using Amazon Cognito.

---

## 2. Requirements Specification

### 2.1 Functional Requirements (FR)
- **FR-01 (Authentication & Access Control):** Secure user login, session management, and role-based permissions (Admin can add/edit/delete; Staff has operational view/record permissions).
- **FR-02 (Product Management):** Add, update, view, deactivate, search, filter, and sort products with attributes (ID, name, category, unit price, quantity, minimum stock level, supplier).
- **FR-03 (Supplier Management):** Maintain supplier profiles (ID, name, contact person, phone, email, address, products supplied).
- **FR-04 (Purchase Management):** Record purchase orders from suppliers, validating positive quantities, updating supplier history, and increasing current stock.
- **FR-05 (Sales Management):** Record customer sales orders, validating positive quantities, strictly preventing over-sales beyond available stock, decreasing current stock, and logging timestamped records for demand modeling.
- **FR-06 (Inventory & Alerts):** Automatically recalculate stock levels and flag products where $\text{Current Stock} \le \text{Minimum Stock Level}$ with active alerts on dashboard and alerts views.
- **FR-07 (Intelligent Stock Prediction):** Ingest historical sales time-series data to compute forecasted demand over future lead times using Simple Moving Average (SMA), Weighted Moving Average (WMA), and Single Exponential Smoothing (SES).
- **FR-08 (Restocking Recommendation):** Dynamically recommend reorder quantities:
  $$\text{Recommended Restock} = \max(0, \text{Predicted Demand} + \text{Safety Stock} - \text{Current Stock})$$
- **FR-09 (Reporting & Exports):** Generate summarized tabular reports for inventory, sales, purchases, low-stock alerts, and forecasts, with downloadable CSV and printable/PDF options.
- **FR-10 (Monitoring):** Log all business operations and errors into Amazon CloudWatch for auditable observability.

### 2.2 Non-Functional Requirements (NFR)
- **NFR-01 (Performance & Latency):** Sub-second API response times (< 400ms) for transactional routes under typical student and small-business loads.
- **NFR-02 (Zero-Cost / Free-Tier Friendly):** Local-first architecture allows full local development and testing with zero AWS charges, while AWS cloud deployment stays within AWS Free Tier limits (DynamoDB 25 RCU/WCU, Lambda 1M requests/mo, S3 5GB, Cognito 50k MAU).
- **NFR-03 (Reliability & Consistency):** Transactional validation prevents negative inventory balances and phantom stock counts.
- **NFR-04 (Security):** Zero hardcoded credentials; strictly enforces environment variable isolation, CORS controls, and parameter sanitization.
- **NFR-05 (Maintainability & Explanability):** Codebase is modular, cleanly commented, and adheres to academic software engineering standards for faculty presentation.

---

## 3. Technology Stack & AWS Mapping

| Layer | Local Development | AWS Cloud Target |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, Vanilla CSS Design System, Recharts | AWS Amplify Hosting / S3 + CloudFront |
| **Authentication** | Role-Based Local Auth Provider (Admin/Staff) | Amazon Cognito User Pools |
| **API Gateway** | FastAPI REST Server (`uvicorn`) | Amazon API Gateway (REST API) |
| **Compute Logic** | Python 3.14 Handlers / FastAPI Routes | AWS Lambda (Python runtime) |
| **Database** | Embedded SQLite with 1:1 DynamoDB Schema Mapping | Amazon DynamoDB (Single-Table / Multi-Table Design) |
| **Blob Storage** | Local File System (`/backend/data/reports/`) | Amazon S3 Bucket |
| **Observability** | Python Logging / Console | Amazon CloudWatch Logs & Metrics |
| **Forecasting Engine**| Modular Python ML Engine (`ml/forecaster.py`) | AWS Lambda ML Layer / Scheduled Worker |

---

## 4. Development Workflow (Local-First)
```
1. Local Architecture Setup -> 2. Domain Data & Storage Layer -> 3. REST API & Validation
    -> 4. Forecasting Engine -> 5. React Dashboard UI -> 6. Automated Test Suite
    -> 7. AWS CloudFormation / Deployment Artifacts -> 8. Faculty Demo Runbook
```
