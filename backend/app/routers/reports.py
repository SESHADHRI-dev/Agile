import csv
import io
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from typing import Dict, Any, Optional
from datetime import datetime
from backend.app.database import db
from backend.app.auth import get_current_user
from backend.app.config import STORAGE_MODE, S3_REPORTS_BUCKET, AWS_REGION, REPORTS_DIR
from ml.forecaster import DemandForecaster

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary", response_model=Dict[str, Any])
def get_reports_summary(user: dict = Depends(get_current_user)):
    """Executive reporting KPIs."""
    products = db.get_products()
    purchases = db.get_purchases(limit=100)
    sales = db.get_sales(limit=100)
    
    total_sales_revenue = round(sum(s["total_revenue"] for s in sales), 2)
    total_purchase_spend = round(sum(p["total_cost"] for p in purchases), 2)
    total_inventory_value = round(sum(p["quantity"] * p["price"] for p in products), 2)

    return {
        "success": True,
        "total_products": len(products),
        "total_inventory_value": total_inventory_value,
        "total_sales_revenue": total_sales_revenue,
        "total_purchase_spend": total_purchase_spend,
        "recent_sales_count": len(sales),
        "recent_purchases_count": len(purchases)
    }


@router.get("/export")
def export_report(
    report_type: str = Query("inventory", pattern="^(inventory|sales|purchases|predictions|low_stock)$"),
    format: str = Query("csv", pattern="^(csv)$"),
    user: dict = Depends(get_current_user)
):
    """
    Exports a tabular audit report as CSV.
    If in AWS mode, can additionally sync artifact to Amazon S3.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{report_type}_{timestamp}.csv"

    if report_type == "inventory":
        writer.writerow(["Product ID", "Product Name", "Category", "Unit Price ($)", "Quantity in Stock", "Min Stock Level", "Status", "Valuation ($)"])
        for p in db.get_products():
            val = round(p["quantity"] * p["price"], 2)
            writer.writerow([p["id"], p["name"], p["category"], f"{p['price']:.2f}", p["quantity"], p["min_stock_level"], p["status"], f"{val:.2f}"])

    elif report_type == "low_stock":
        writer.writerow(["Product ID", "Product Name", "Category", "Current Stock", "Min Stock Level", "Deficit Units", "Status"])
        for p in db.get_products():
            if p["status"] in ["LOW STOCK", "OUT OF STOCK"]:
                deficit = max(0, p["min_stock_level"] - p["quantity"])
                writer.writerow([p["id"], p["name"], p["category"], p["quantity"], p["min_stock_level"], deficit, p["status"]])

    elif report_type == "sales":
        writer.writerow(["Sale ID", "Product ID", "Product Name", "Quantity Sold", "Unit Price ($)", "Total Revenue ($)", "Sale Date", "Recorded By"])
        for s in db.get_sales(limit=1000):
            writer.writerow([s["id"], s["product_id"], s.get("product_name", ""), s["quantity"], f"{s['unit_price']:.2f}", f"{s['total_revenue']:.2f}", s["sale_date"], s["created_by"]])

    elif report_type == "purchases":
        writer.writerow(["Purchase ID", "Product ID", "Product Name", "Supplier Name", "Quantity", "Unit Cost ($)", "Total Cost ($)", "Purchase Date", "Recorded By"])
        for p in db.get_purchases(limit=1000):
            writer.writerow([p["id"], p["product_id"], p.get("product_name", ""), p.get("supplier_name", ""), p["quantity"], f"{p['unit_cost']:.2f}", f"{p['total_cost']:.2f}", p["purchase_date"], p["created_by"]])

    elif report_type == "predictions":
        writer.writerow(["Product ID", "Product Name", "Category", "Current Stock", "Forecast Period (Days)", "Predicted Demand", "Safety Stock", "Recommended Restock", "Urgency Status"])
        for prod in db.get_products():
            sales = db.get_sales(limit=200, product_id=prod["id"])
            rec = DemandForecaster.generate_recommendation(sales_records=sales, current_stock=prod["quantity"])
            writer.writerow([
                prod["id"], prod["name"], prod["category"], prod["quantity"],
                rec["forecast_horizon_days"], rec["predicted_demand"],
                rec["safety_stock"], rec["recommended_restock"], rec["urgency_status"]
            ])

    csv_content = output.getvalue()
    
    # Save locally
    local_path = REPORTS_DIR / filename
    local_path.write_text(csv_content, encoding="utf-8")

    # If AWS mode, upload to S3
    s3_url = None
    if STORAGE_MODE == "aws":
        try:
            import boto3
            s3 = boto3.client("s3", region_name=AWS_REGION)
            s3.put_object(
                Bucket=S3_REPORTS_BUCKET,
                Key=f"reports/{filename}",
                Body=csv_content.encode("utf-8"),
                ContentType="text/csv"
            )
            s3_url = f"https://{S3_REPORTS_BUCKET}.s3.{AWS_REGION}.amazonaws.com/reports/{filename}"
        except Exception as e:
            # Fall back to local file download
            pass

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Report-Filename": filename,
            "X-S3-URL": s3_url or ""
        }
    )
