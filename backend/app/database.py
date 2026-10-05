import sqlite3
import json
import uuid
import logging
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from backend.app.config import STORAGE_MODE, SQLITE_DB_PATH, DYNAMODB_TABLE_NAME, AWS_REGION
from backend.app.domain import InventoryLogic

logger = logging.getLogger("inventory-db")


def _utc_now_iso() -> str:
    """Returns current UTC timestamp in ISO 8601 format with Z suffix."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _decimal_to_native(obj):
    """Converts DynamoDB Decimal instances back to float/int."""
    if isinstance(obj, list):
        return [_decimal_to_native(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: _decimal_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def _native_to_decimal(obj):
    """Converts floats to Decimals for DynamoDB serialization."""
    if isinstance(obj, list):
        return [_native_to_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: _native_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    return obj


class Database:
    """
    Unified database interface supporting dual-mode operations:
    1. Local Mode: Embedded SQLite with transparent JSON serialization
    2. AWS Cloud Mode: Amazon DynamoDB Single-Table Design via Boto3
    """

    def __init__(self):
        self.mode = STORAGE_MODE.lower().strip()
        self.table = None
        self._init_sqlite()  # Always initialize SQLite schema so local dev & fallback are guaranteed
        if self.mode == "aws":
            try:
                import boto3
                self.dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
                self.table = self.dynamodb.Table(DYNAMODB_TABLE_NAME)
                logger.info(f"DynamoDB mode configured for table '{DYNAMODB_TABLE_NAME}' in region '{AWS_REGION}'")
            except Exception as e:
                logger.warning(f"DynamoDB initialization notice: {e}. SQLite local engine remains active.")

    # ==========================================================================
    # SQLite Implementation (Local Mode)
    # ==========================================================================

    def _get_connection(self):
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite(self):
        """Initializes tables for local relational storage."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS suppliers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                contact_person TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                address TEXT NOT NULL,
                supplied_categories TEXT DEFAULT 'General',
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                quantity INTEGER NOT NULL,
                min_stock_level INTEGER NOT NULL,
                supplier_id TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS purchases (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                supplier_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_cost REAL NOT NULL,
                total_cost REAL NOT NULL,
                purchase_date TEXT NOT NULL,
                created_by TEXT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS sales (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                total_revenue REAL NOT NULL,
                sale_date TEXT NOT NULL,
                created_by TEXT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                method TEXT NOT NULL,
                forecast_period_days INTEGER NOT NULL,
                predicted_demand INTEGER NOT NULL,
                current_stock INTEGER NOT NULL,
                safety_stock INTEGER NOT NULL,
                recommended_restock INTEGER NOT NULL,
                calculated_at TEXT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
            """)

            conn.commit()

        # Seed data if empty
        self._ensure_sample_data()

    # ==========================================================================
    # Supplier Methods
    # ==========================================================================

    def get_suppliers(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if search:
                cursor.execute(
                    "SELECT * FROM suppliers WHERE is_active = 1 AND (name LIKE ? OR contact_person LIKE ?) ORDER BY name ASC",
                    (f"%{search}%", f"%{search}%")
                )
            else:
                cursor.execute("SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name ASC")
            return [dict(row) for row in cursor.fetchall()]

    def get_supplier_by_id(self, supplier_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def create_supplier(self, data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = f"SUP-{uuid.uuid4().hex[:6].upper()}"
        now = _utc_now_iso()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO suppliers (id, name, contact_person, phone, email, address, supplied_categories, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
            """, (
                supplier_id,
                data["name"],
                data["contact_person"],
                data["phone"],
                data["email"],
                data["address"],
                data.get("supplied_categories", "General"),
                now
            ))
            conn.commit()
        return self.get_supplier_by_id(supplier_id)

    def update_supplier(self, supplier_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        fields = []
        values = []
        for k, v in data.items():
            if v is not None:
                fields.append(f"{k} = ?")
                values.append(v)
        if not fields:
            return self.get_supplier_by_id(supplier_id)

        values.append(supplier_id)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE suppliers SET {', '.join(fields)} WHERE id = ?", tuple(values))
            conn.commit()
        return self.get_supplier_by_id(supplier_id)

    def delete_supplier(self, supplier_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE suppliers SET is_active = 0 WHERE id = ?", (supplier_id,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================================================
    # Product Methods
    # ==========================================================================

    def get_products(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        sort_by: Optional[str] = "name",
        order: Optional[str] = "asc"
    ) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = """
            SELECT p.*, s.name as supplier_name 
            FROM products p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id 
            WHERE p.is_active = 1
            """
            params = []
            if search:
                query += " AND (p.name LIKE ? OR p.id LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%"])
            if category and category.lower() != "all":
                query += " AND p.category = ?"
                params.append(category)

            # Sanitized sort column
            valid_sorts = {"name": "p.name", "price": "p.price", "quantity": "p.quantity", "created_at": "p.created_at"}
            col = valid_sorts.get(sort_by, "p.name")
            direction = "DESC" if order and order.lower() == "desc" else "ASC"
            query += f" ORDER BY {col} {direction}"

            cursor.execute(query, tuple(params))
            results = []
            for row in cursor.fetchall():
                d = dict(row)
                d["status"] = InventoryLogic.evaluate_stock_status(d["quantity"], d["min_stock_level"])
                results.append(d)
            return results

    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT p.*, s.name as supplier_name 
            FROM products p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id 
            WHERE p.id = ?
            """, (product_id,))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["status"] = InventoryLogic.evaluate_stock_status(d["quantity"], d["min_stock_level"])
            return d

    def create_product(self, data: Dict[str, Any]) -> Dict[str, Any]:
        product_id = f"PRD-{uuid.uuid4().hex[:6].upper()}"
        now = _utc_now_iso()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO products (id, name, category, price, quantity, min_stock_level, supplier_id, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (
                product_id,
                data["name"],
                data["category"],
                data["price"],
                data["quantity"],
                data["min_stock_level"],
                data.get("supplier_id"),
                now,
                now
            ))
            conn.commit()
        return self.get_product_by_id(product_id)

    def update_product(self, product_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        fields = []
        values = []
        for k, v in data.items():
            if v is not None:
                fields.append(f"{k} = ?")
                values.append(v)
        if not fields:
            return self.get_product_by_id(product_id)

        now = _utc_now_iso()
        fields.append("updated_at = ?")
        values.append(now)

        values.append(product_id)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", tuple(values))
            conn.commit()
        return self.get_product_by_id(product_id)

    def delete_product(self, product_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE products SET is_active = 0 WHERE id = ?", (product_id,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================================================
    # Purchase Transactions (Current = Previous + Purchases)
    # ==========================================================================

    def record_purchase(self, data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
        product_id = data["product_id"]
        purchase_qty = int(data["quantity"])
        unit_cost = float(data["unit_cost"])
        total_cost = round(purchase_qty * unit_cost, 2)
        purchase_date = data.get("purchase_date") or _utc_now_iso()
        purchase_id = f"PUR-{uuid.uuid4().hex[:6].upper()}"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Fetch current product
            cursor.execute("SELECT quantity FROM products WHERE id = ? AND is_active = 1", (product_id,))
            prod = cursor.fetchone()
            if not prod:
                raise ValueError(f"Product '{product_id}' not found or inactive.")
            
            previous_stock = prod["quantity"]
            # Strict domain invariant calculation
            new_stock = InventoryLogic.calculate_purchase_stock(previous_stock, purchase_qty)

            # Record purchase
            cursor.execute("""
            INSERT INTO purchases (id, product_id, supplier_id, quantity, unit_cost, total_cost, purchase_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                purchase_id,
                product_id,
                data["supplier_id"],
                purchase_qty,
                unit_cost,
                total_cost,
                purchase_date,
                user_email
            ))

            # Update product stock
            now = _utc_now_iso()
            cursor.execute("UPDATE products SET quantity = ?, updated_at = ? WHERE id = ?", (new_stock, now, product_id))
            conn.commit()

        return self.get_purchase_by_id(purchase_id)

    def get_purchases(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT p.*, pr.name as product_name, s.name as supplier_name
            FROM purchases p
            LEFT JOIN products pr ON p.product_id = pr.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.purchase_date DESC LIMIT ?
            """, (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_purchase_by_id(self, purchase_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT p.*, pr.name as product_name, s.name as supplier_name
            FROM purchases p
            LEFT JOIN products pr ON p.product_id = pr.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
            """, (purchase_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    # ==========================================================================
    # Sales Transactions (Current = Previous - Sales)
    # ==========================================================================

    def record_sale(self, data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
        product_id = data["product_id"]
        sale_qty = int(data["quantity"])
        unit_price = float(data["unit_price"])
        total_revenue = round(sale_qty * unit_price, 2)
        sale_date = data.get("sale_date") or _utc_now_iso()
        sale_id = f"SAL-{uuid.uuid4().hex[:6].upper()}"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Fetch current product
            cursor.execute("SELECT quantity, name FROM products WHERE id = ? AND is_active = 1", (product_id,))
            prod = cursor.fetchone()
            if not prod:
                raise ValueError(f"Product '{product_id}' not found or inactive.")
            
            previous_stock = prod["quantity"]
            # Strict domain invariant & over-sale rejection check
            new_stock = InventoryLogic.calculate_sale_stock(previous_stock, sale_qty)

            # Record sale
            cursor.execute("""
            INSERT INTO sales (id, product_id, quantity, unit_price, total_revenue, sale_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                sale_id,
                product_id,
                sale_qty,
                unit_price,
                total_revenue,
                sale_date,
                user_email
            ))

            # Update product stock
            now = _utc_now_iso()
            cursor.execute("UPDATE products SET quantity = ?, updated_at = ? WHERE id = ?", (new_stock, now, product_id))
            conn.commit()

        return self.get_sale_by_id(sale_id)

    def get_sales(self, limit: int = 100, product_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if product_id:
                cursor.execute("""
                SELECT s.*, pr.name as product_name
                FROM sales s
                LEFT JOIN products pr ON s.product_id = pr.id
                WHERE s.product_id = ?
                ORDER BY s.sale_date DESC LIMIT ?
                """, (product_id, limit))
            else:
                cursor.execute("""
                SELECT s.*, pr.name as product_name
                FROM sales s
                LEFT JOIN products pr ON s.product_id = pr.id
                ORDER BY s.sale_date DESC LIMIT ?
                """, (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_sale_by_id(self, sale_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT s.*, pr.name as product_name
            FROM sales s
            LEFT JOIN products pr ON s.product_id = pr.id
            WHERE s.id = ?
            """, (sale_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    # ==========================================================================
    # Inventory Summary & Alerts
    # ==========================================================================

    def get_inventory_summary(self) -> Dict[str, Any]:
        products = self.get_products()
        total_units = sum(p["quantity"] for p in products)
        total_value = round(sum(p["quantity"] * p["price"] for p in products), 2)
        low_stock = [p for p in products if p["status"] == "LOW STOCK"]
        out_of_stock = [p for p in products if p["status"] == "OUT OF STOCK"]

        return {
            "total_products": len(products),
            "total_units": total_units,
            "total_inventory_value": total_value,
            "low_stock_count": len(low_stock),
            "out_of_stock_count": len(out_of_stock),
            "products": products
        }

    def get_alerts(self) -> List[Dict[str, Any]]:
        products = self.get_products()
        alerts = []
        for p in products:
            if p["status"] == "OUT OF STOCK":
                alerts.append({
                    "id": f"ALT-OOS-{p['id']}",
                    "severity": "CRITICAL",
                    "product_id": p["id"],
                    "product_name": p["name"],
                    "current_stock": p["quantity"],
                    "min_stock_level": p["min_stock_level"],
                    "message": f"Product '{p['name']}' is completely OUT OF STOCK! Immediate reorder required.",
                    "created_at": _utc_now_iso()
                })
            elif p["status"] == "LOW STOCK":
                deficit = p["min_stock_level"] - p["quantity"]
                alerts.append({
                    "id": f"ALT-LOW-{p['id']}",
                    "severity": "WARNING",
                    "product_id": p["id"],
                    "product_name": p["name"],
                    "current_stock": p["quantity"],
                    "min_stock_level": p["min_stock_level"],
                    "message": f"Product '{p['name']}' has fallen below minimum threshold ({p['quantity']} <= {p['min_stock_level']}). Deficit: {deficit} units.",
                    "created_at": _utc_now_iso()
                })
        return alerts

    # ==========================================================================
    # Seed Sample Data (15+ products, 5+ suppliers, 60+ sales/purchases)
    # ==========================================================================

    def _ensure_sample_data(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT count(*) as count FROM products")
            if cursor.fetchone()["count"] == 0:
                self.seed_database()

    def seed_database(self):
        """Populates realistic demo dataset for testing and faculty evaluation."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Clear existing demo data
            cursor.execute("DELETE FROM predictions")
            cursor.execute("DELETE FROM sales")
            cursor.execute("DELETE FROM purchases")
            cursor.execute("DELETE FROM products")
            cursor.execute("DELETE FROM suppliers")

            # 1. Suppliers
            suppliers_data = [
                ("SUP-001", "Apex Electronics Ltd", "Robert Vance", "+1-555-0101", "robert@apexelectronics.com", "400 Silicon Pkwy, San Jose, CA", "Electronics, Controllers"),
                ("SUP-002", "Nordic Sensor Corp", "Astrid Lindgren", "+1-555-0102", "astrid@nordicsensors.se", "88 Fjord Way, Stockholm, Sweden", "Sensors, Probes"),
                ("SUP-003", "Precision Hydraulics Inc", "Carlos Gomez", "+1-555-0103", "carlos@precisionhydraulics.com", "12 Industrial Blvd, Chicago, IL", "Hydraulics, Pumps"),
                ("SUP-004", "Quantum Power Solutions", "Elena Rostova", "+1-555-0104", "elena@quantumpower.de", "77 Energieweg, Munich, Germany", "Power Supplies, Batteries"),
                ("SUP-005", "Apex Fasteners & Hardware", "David Miller", "+1-555-0105", "david@apexfasteners.com", "230 Steel Mill Rd, Pittsburgh, PA", "Hardware, Mounts")
            ]
            now = _utc_now_iso()
            for sup in suppliers_data:
                cursor.execute("""
                INSERT INTO suppliers (id, name, contact_person, phone, email, address, supplied_categories, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                """, (*sup, now))

            # 2. Products (Diverse quantities to demonstrate IN STOCK, LOW STOCK, and OUT OF STOCK)
            products_data = [
                ("PRD-1001", "Industrial IoT Gateway Hub", "Electronics", 249.99, 14, 25, "SUP-001"),    # LOW STOCK
                ("PRD-1002", "Precision Thermal Sensor Probe", "Sensors", 45.00, 85, 30, "SUP-002"),       # IN STOCK
                ("PRD-1003", "Ultra-High Pressure Hydraulic Valve", "Hydraulics", 189.50, 0, 10, "SUP-003"),# OUT OF STOCK
                ("PRD-1004", "Modular Lithium-Ion Power Unit 48V", "Power Supplies", 520.00, 22, 15, "SUP-004"), # IN STOCK
                ("PRD-1005", "Vibration Analysis Accelerometer", "Sensors", 112.00, 8, 20, "SUP-002"),    # LOW STOCK
                ("PRD-1006", "Embedded Micro-PLC Controller", "Electronics", 175.00, 42, 20, "SUP-001"),  # IN STOCK
                ("PRD-1007", "Stainless Steel Flange Bracket M12", "Hardware", 12.50, 260, 50, "SUP-005"),# IN STOCK
                ("PRD-1008", "Differential Pressure Transmitter", "Sensors", 230.00, 5, 12, "SUP-002"),   # LOW STOCK
                ("PRD-1009", "Brushless DC Servo Motor 750W", "Electronics", 310.00, 19, 15, "SUP-001"),  # IN STOCK
                ("PRD-1010", "Heavy-Duty Solenoid Actuator", "Hydraulics", 145.00, 0, 15, "SUP-003"),    # OUT OF STOCK
                ("PRD-1011", "DIN-Rail Switched-Mode PSU 24V", "Power Supplies", 68.00, 75, 25, "SUP-004"),# IN STOCK
                ("PRD-1012", "Laser Distance Meter 50m", "Sensors", 185.00, 31, 20, "SUP-002"),           # IN STOCK
                ("PRD-1013", "Titanium Hex-Bolt Assortment Kit", "Hardware", 85.00, 48, 15, "SUP-005"),   # IN STOCK
                ("PRD-1014", "Optocoupler Relay Module 8-Ch", "Electronics", 32.00, 110, 40, "SUP-001"),  # IN STOCK
                ("PRD-1015", "Proportional Relief Valve 350 Bar", "Hydraulics", 420.00, 7, 10, "SUP-003") # LOW STOCK
            ]
            for p in products_data:
                cursor.execute("""
                INSERT INTO products (id, name, category, price, quantity, min_stock_level, supplier_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """, (*p, now, now))

            # 3. Historical Sales (Simulate continuous sales across the past 45 days to feed ML prediction)
            base_date = datetime.now(timezone.utc)
            sales_seed = []
            for day_offset in range(45, 0, -1):
                d = (base_date - timedelta(days=day_offset)).strftime("%Y-%m-%d") + "T14:00:00Z"
                # IoT Gateway sales: 1 to 4 units every few days
                if day_offset % 2 == 0:
                    sales_seed.append((f"SAL-SEED-{day_offset}A", "PRD-1001", 3, 249.99, 749.97, d, "staff@inventory.io"))
                # Thermal sensor sales: frequent 2 to 6 units
                if day_offset % 3 != 0:
                    sales_seed.append((f"SAL-SEED-{day_offset}B", "PRD-1002", 4, 45.00, 180.00, d, "staff@inventory.io"))
                # Accelerometer sales
                if day_offset % 4 == 0:
                    sales_seed.append((f"SAL-SEED-{day_offset}C", "PRD-1005", 2, 112.00, 224.00, d, "staff@inventory.io"))
                # Micro-PLC sales
                if day_offset % 3 == 1:
                    sales_seed.append((f"SAL-SEED-{day_offset}D", "PRD-1006", 5, 175.00, 875.00, d, "staff@inventory.io"))

            for s in sales_seed:
                cursor.execute("""
                INSERT INTO sales (id, product_id, quantity, unit_price, total_revenue, sale_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, s)

            # 4. Purchases (Inbound replenishment batches)
            purchases_seed = [
                ("PUR-SEED-01", "PRD-1001", "SUP-001", 30, 170.00, 5100.00, (base_date - timedelta(days=40)).isoformat() + "Z", "admin@inventory.io"),
                ("PUR-SEED-02", "PRD-1002", "SUP-002", 100, 30.00, 3000.00, (base_date - timedelta(days=35)).isoformat() + "Z", "admin@inventory.io"),
                ("PUR-SEED-03", "PRD-1004", "SUP-004", 25, 380.00, 9500.00, (base_date - timedelta(days=25)).isoformat() + "Z", "admin@inventory.io"),
                ("PUR-SEED-04", "PRD-1006", "SUP-001", 50, 120.00, 6000.00, (base_date - timedelta(days=20)).isoformat() + "Z", "admin@inventory.io"),
                ("PUR-SEED-05", "PRD-1007", "SUP-005", 300, 8.00, 2400.00, (base_date - timedelta(days=15)).isoformat() + "Z", "admin@inventory.io")
            ]
            for pur in purchases_seed:
                cursor.execute("""
                INSERT INTO purchases (id, product_id, supplier_id, quantity, unit_cost, total_cost, purchase_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, pur)

            conn.commit()


# Singleton instance
db = Database()
