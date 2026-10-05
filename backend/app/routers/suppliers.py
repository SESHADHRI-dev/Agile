from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional, List, Dict, Any
from backend.app.models import SupplierCreate, SupplierUpdate, SupplierResponse
from backend.app.database import db
from backend.app.auth import get_current_user, require_role

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=Dict[str, Any])
def list_suppliers(
    search: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """List all active suppliers with optional search."""
    suppliers = db.get_suppliers(search=search)
    return {
        "success": True,
        "count": len(suppliers),
        "data": suppliers
    }


@router.get("/{supplier_id}", response_model=Dict[str, Any])
def get_supplier(supplier_id: str, user: dict = Depends(get_current_user)):
    """Fetch single supplier details."""
    sup = db.get_supplier_by_id(supplier_id)
    if not sup:
        raise HTTPException(status_code=404, detail=f"Supplier with ID '{supplier_id}' not found.")
    return {"success": True, "data": sup}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
def create_supplier(
    payload: SupplierCreate,
    user: dict = Depends(require_role(["Admin"]))
):
    """Create a new supplier profile."""
    created = db.create_supplier(payload.model_dump())
    return {"success": True, "data": created, "message": "Supplier created successfully."}


@router.put("/{supplier_id}", response_model=Dict[str, Any])
def update_supplier(
    supplier_id: str,
    payload: SupplierUpdate,
    user: dict = Depends(require_role(["Admin"]))
):
    """Update supplier information."""
    existing = db.get_supplier_by_id(supplier_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Supplier with ID '{supplier_id}' not found.")
    
    updated = db.update_supplier(supplier_id, payload.model_dump(exclude_unset=True))
    return {"success": True, "data": updated, "message": "Supplier updated successfully."}


@router.delete("/{supplier_id}", response_model=Dict[str, Any])
def delete_supplier(
    supplier_id: str,
    user: dict = Depends(require_role(["Admin"]))
):
    """Deactivate supplier."""
    existing = db.get_supplier_by_id(supplier_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Supplier with ID '{supplier_id}' not found.")
    
    success = db.delete_supplier(supplier_id)
    return {"success": success, "message": f"Supplier '{supplier_id}' deactivated."}
