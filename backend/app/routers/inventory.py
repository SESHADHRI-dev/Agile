from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from backend.app.database import db
from backend.app.auth import get_current_user

router = APIRouter(prefix="", tags=["Inventory & Alerts"])


@router.get("/inventory", response_model=Dict[str, Any])
def get_inventory_status(user: dict = Depends(get_current_user)):
    """
    Returns complete inventory metrics and item breakdown:
    - Current stock
    - Minimum stock level
    - Stock status (IN STOCK, LOW STOCK, OUT OF STOCK)
    - Inventory valuation
    """
    summary = db.get_inventory_summary()
    return {"success": True, **summary}


@router.get("/alerts", response_model=Dict[str, Any])
def get_active_alerts(user: dict = Depends(get_current_user)):
    """
    Returns active alerts for:
    - Products where current stock == 0 (CRITICAL)
    - Products where current stock <= min_stock_level (WARNING)
    """
    alerts = db.get_alerts()
    return {
        "success": True,
        "count": len(alerts),
        "critical_count": sum(1 for a in alerts if a["severity"] == "CRITICAL"),
        "warning_count": sum(1 for a in alerts if a["severity"] == "WARNING"),
        "data": alerts
    }
