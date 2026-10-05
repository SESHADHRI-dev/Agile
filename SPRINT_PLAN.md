# Agile Sprint Plan: Intelligent Inventory Management System

**Framework:** Agile Scrum  
**Cadence:** 6 Focused Development Sprints  
**Target Delivery:** Full-stack, tested, cloud-ready academic software engineering system

---

## Sprint Breakdown

### Sprint 1: Project Setup, Architecture & Authentication
- [x] Analyze comprehensive project requirements (`agile.md`).
- [x] Initialize Git repository, `.gitignore`, `.env.example`, and directory structure.
- [x] Create core architectural & engineering documentation (`PROJECT_PLAN.md`, `ARCHITECTURE.md`, `SPRINT_PLAN.md`, `COST_AND_FREE_TIER.md`).
- [x] Implement Authentication Service (Role-based access: Admin & Staff; Cognito integration layer & mock provider for local development).
- [x] Design standardized API response and error formatting middleware.

### Sprint 2: Product & Supplier Management
- [x] Design DynamoDB single-table & entity schemas (`DATABASE_DESIGN.md`).
- [x] Implement backend storage abstraction (Dual-engine: local SQLite/Mock with DynamoDB Boto3 cloud implementation).
- [x] Build Product Management API (Add, Edit, View, Deactivate/Delete, Search, Filter, Sort).
- [x] Build Supplier Management API (Add, Edit, View, Search, Filter, Link to products).
- [x] Implement input validation & data hygiene (non-empty names, positive prices, valid email/phone formats).

### Sprint 3: Purchase & Sales Transaction Engine
- [x] Build Purchase Management API:
  - Record purchase orders from suppliers.
  - Automatically update stock: $\text{New Stock} = \text{Previous Stock} + \text{Purchased Quantity}$.
- [x] Build Sales Management API:
  - Record customer sales orders.
  - Enforce inventory guardrail: Strictly reject sales when $\text{Quantity Sold} > \text{Available Stock}$.
  - Automatically update stock: $\text{New Stock} = \text{Previous Stock} - \text{Quantity Sold}$.
- [x] Maintain immutable historical sales records with ISO-8601 timestamps for machine learning ingestion.

### Sprint 4: Inventory Tracking & Low-Stock Alerts
- [x] Implement Inventory aggregation & status evaluation engine:
  - Status classification: `IN STOCK`, `LOW STOCK` ($\text{Current} \le \text{Min}$), `OUT OF STOCK` ($\text{Current} = 0$).
  - Calculate total inventory valuation ($\sum \text{Quantity} \times \text{Unit Price}$).
  - Track last purchase and last sale dates per item.
- [x] Build Low-Stock & Out-of-Stock Alert Service with severity indicators.
- [x] Seed realistic demo dataset (15+ products, 5+ suppliers, 30+ transactions across historical dates).

### Sprint 5: Intelligent Stock Prediction, Restocking & Reporting
- [x] Build Machine Learning / Forecasting Engine (`ml/forecaster.py`):
  - Simple Moving Average (SMA)
  - Weighted Moving Average (WMA)
  - Single Exponential Smoothing (SES)
- [x] Implement Restocking Recommendation Algorithm:
  $$\text{Recommended Order} = \max(0, \text{Predicted Demand} + \text{Safety Stock} - \text{Current Stock})$$
- [x] Build Reporting Engine:
  - Inventory summary report
  - Sales & purchase audit report
  - Low-stock priority report
  - Forecast & restock order sheet
  - CSV & printable/PDF export capabilities with Amazon S3 cloud upload support.
- [x] Build React Dashboard UI with KPI cards, charts, interactive tables, and modern dark/light styling.

### Sprint 6: Automated Testing, Cloud Infrastructure & Final Demonstration
- [x] Build comprehensive automated test suite (`tests/`):
  - Mandatory stock math test: $100 + 50 = 150$
  - Mandatory sale math test: $150 - 30 = 120$
  - Mandatory low-stock test: $10 \le 20 \rightarrow \text{LOW STOCK}$
  - Mandatory out-of-stock test: $0 \rightarrow \text{OUT OF STOCK}$
  - Mandatory over-sale rejection test: $10 \text{ stock}, 15 \text{ sale} \rightarrow \text{REJECT}$
  - Prediction accuracy and bounds testing.
- [x] Write Infrastructure as Code template (`infrastructure/template.yaml` for AWS CloudFormation/SAM).
- [x] Package standalone AWS Lambda handlers in `lambda/`.
- [x] Write `DEPLOYMENT.md`, `TESTING.md`, `API_DOCUMENTATION.md`, and `README.md`.
- [x] Execute complete end-to-end verification and compile faculty demonstration guide.
