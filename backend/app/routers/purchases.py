from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from backend.app.models import PurchaseCreate
from backend.app.database import db
from backend.app.auth import get_current_user

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.get("", response_model=Dict[str, Any])
def list_purchases(limit: int = 50, user: dict = Depends(get_current_user)):
    """List recent purchase transactions."""
    purchases = db.get_purchases(limit=limit)
    return {"success": True, "count": len(purchases), "data": purchases}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
def record_purchase(
    payload: PurchaseCreate,
    user: dict = Depends(get_current_user)
):
    """
    Record an inbound purchase order.
    Automatically increments product stock balance:
    Current Stock = Previous Stock + Purchase Quantity
    """
    try:
        user_email = user.get("username", "staff@inventory.io")
        record = db.record_purchase(payload.model_dump(), user_email)
        # Fetch updated product for feedback
        updated_product = db.get_product_by_id(payload.product_id)
        return {
            "success": True,
            "data": record,
            "updated_product": updated_product,
            "message": f"Purchase recorded! Added {payload.quantity} units to '{updated_product['name']}'. New stock: {updated_product['quantity']}."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error processing purchase: {str(e)}")
