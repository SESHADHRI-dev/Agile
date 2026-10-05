# Database Design: Amazon DynamoDB & Local Relational Storage

## 1. Design Overview
The database layer is engineered with **DynamoDB Single-Table Design** principles while maintaining an entity-relational abstraction for local zero-cost SQLite development.

Table Name: `InventoryManagementTable`  
Partition Key (`PK`): String  
Sort Key (`SK`): String  

---

## 2. Entity Mapping & Access Patterns

### 2.1 Entities & Key Structure

| Entity | PK Pattern | SK Pattern | Attributes |
| :--- | :--- | :--- | :--- |
| **User** | `USER#<user_id>` | `METADATA` | `username`, `email`, `role` (`Admin`\|`Staff`), `created_at` |
| **Product** | `PRODUCT#<product_id>` | `METADATA` | `name`, `category`, `price`, `quantity`, `min_stock_level`, `supplier_id`, `created_at`, `updated_at`, `is_active` |
| **Supplier** | `SUPPLIER#<supplier_id>` | `METADATA` | `name`, `contact_person`, `phone`, `email`, `address`, `supplied_categories`, `is_active` |
| **Purchase** | `PURCHASE#<purchase_id>` | `DATE#<iso_date>` | `product_id`, `supplier_id`, `quantity`, `unit_cost`, `total_cost`, `purchase_date`, `created_by` |
| **Sale** | `SALE#<sale_id>` | `DATE#<iso_date>` | `product_id`, `quantity`, `unit_price`, `total_revenue`, `sale_date`, `created_by` |
| **Prediction** | `PREDICTION#<product_id>`| `DATE#<iso_date>` | `method`, `forecast_period_days`, `predicted_demand`, `current_stock`, `safety_stock`, `recommended_restock`, `calculated_at` |

### 2.2 Global Secondary Indexes (GSI)
To support querying sales and purchases chronologically by product without full table scans:

1. **GSI1 (Product Transaction Time-Series):**
   - Partition Key: `GSI1_PK` (e.g. `PRODUCT#<product_id>`)
   - Sort Key: `GSI1_SK` (e.g. `SALE#<iso_date>` or `PURCHASE#<iso_date>`)
   - Projection: All attributes.
   - Purpose: Ingestion into the ML forecasting pipeline.

---

## 3. Example JSON Records

### Product Record:
```json
{
  "PK": "PRODUCT#PRD-1001",
  "SK": "METADATA",
  "product_id": "PRD-1001",
  "name": "Industrial IoT Sensor Hub",
  "category": "Electronics",
  "price": 149.99,
  "quantity": 18,
  "min_stock_level": 25,
  "supplier_id": "SUP-001",
  "is_active": true,
  "created_at": "2026-09-01T10:00:00Z",
  "updated_at": "2026-10-05T12:00:00Z"
}
```

### Sale Record (Feeds Demand Forecasting):
```json
{
  "PK": "SALE#SAL-9042",
  "SK": "DATE#2026-10-02T14:30:00Z",
  "GSI1_PK": "PRODUCT#PRD-1001",
  "GSI1_SK": "SALE#2026-10-02T14:30:00Z",
  "sale_id": "SAL-9042",
  "product_id": "PRD-1001",
  "quantity": 4,
  "unit_price": 149.99,
  "total_revenue": 599.96,
  "sale_date": "2026-10-02T14:30:00Z",
  "created_by": "staff@example.com"
}
```

### Prediction Record:
```json
{
  "PK": "PREDICTION#PRD-1001",
  "SK": "DATE#2026-10-05T00:00:00Z",
  "product_id": "PRD-1001",
  "method": "exponential_smoothing",
  "forecast_period_days": 30,
  "predicted_demand": 45,
  "current_stock": 18,
  "safety_stock": 12,
  "recommended_restock": 39,
  "calculated_at": "2026-10-05T18:00:00Z"
}
```

---

## 4. Local Relational Schema (SQLite Mirror)
For offline and zero-cost local execution, the SQLite schema maintains identical field names and relationships across tables:
- `products (id, name, category, price, quantity, min_stock_level, supplier_id, is_active, created_at, updated_at)`
- `suppliers (id, name, contact_person, phone, email, address, supplied_categories, is_active, created_at)`
- `purchases (id, product_id, supplier_id, quantity, unit_cost, total_cost, purchase_date, created_by)`
- `sales (id, product_id, quantity, unit_price, total_revenue, sale_date, created_by)`
- `predictions (id, product_id, method, forecast_period_days, predicted_demand, current_stock, safety_stock, recommended_restock, calculated_at)`
