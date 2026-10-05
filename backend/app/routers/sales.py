from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Dict, Any, Optional
from backend.app.models import SaleCreate
from backend.app.database import db
from backend.app.auth import get_current_user

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("", response_model=Dict[str, Any])
def list_sales(
    limit: int = 100,
    product_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """List historical sales transactions."""
    sales = db.get_sales(limit=limit, product_id=product_id)
    return {"success": True, "count": len(sales), "data": sales}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
def record_sale(
    payload: SaleCreate,
    user: dict = Depends(get_current_user)
):
    """
    Record an outbound customer sale.
    Strictly verifies stock availability:
    - If Quantity Sold > Available Stock, rejects transaction.
    - Automatically updates product stock balance:
      Current Stock = Previous Stock - Quantity Sold
    """
    try:
        user_email = user.get("username", "staff@inventory.io")
        record = db.record_sale(payload.model_dump(), user_email)
        # Fetch updated product
        updated_product = db.get_product_by_id(payload.product_id)
        return {
            "success": True,
            "data": record,
            "updated_product": updated_product,
            "message": f"Sale recorded! Deducted {payload.quantity} units from '{updated_product['name']}'. Remaining stock: {updated_product['quantity']}."
        }
    except ValueError as e:
        # Business logic validation violation (e.g. over-sale)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error processing sale: {str(e)}")
