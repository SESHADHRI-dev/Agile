from fastapi import APIRouter, Depends
from typing import Dict, Any
from backend.app.database import db
from backend.app.auth import require_role

router = APIRouter(prefix="/seed", tags=["Demo Seeding"])


@router.post("", response_model=Dict[str, Any])
def seed_sample_dataset(user: dict = Depends(require_role(["Admin"]))):
    """
    Populates a fresh realistic dataset for academic evaluation:
    - 15 diverse products across 5 industrial categories
    - 5 verified suppliers
    - 60+ sales transactions across 45 historical days
    - 5 recent supplier purchase replenishment batches
    """
    db.seed_database()
    summary = db.get_inventory_summary()
    return {
        "success": True,
        "message": "Database reseeded with realistic demo data.",
        "summary": {
            "total_products": summary["total_products"],
            "total_units": summary["total_units"],
            "total_inventory_value": summary["total_inventory_value"],
            "low_stock_count": summary["low_stock_count"],
            "out_of_stock_count": summary["out_of_stock_count"]
        }
    }
