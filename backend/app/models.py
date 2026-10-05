from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# ==============================================================================
# Auth & User Models
# ==============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    role: str  # "Admin" or "Staff"
    name: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse


# ==============================================================================
# Product Models
# ==============================================================================

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)
    min_stock_level: int = Field(..., ge=0)
    supplier_id: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    supplier_id: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    category: str
    price: float
    quantity: int
    min_stock_level: int
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    status: str  # "IN STOCK", "LOW STOCK", "OUT OF STOCK"
    is_active: bool
    created_at: str
    updated_at: str


# ==============================================================================
# Supplier Models
# ==============================================================================

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    contact_person: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=5, max_length=30)
    email: str = Field(..., max_length=120)
    address: str = Field(..., min_length=3, max_length=250)
    supplied_categories: Optional[str] = "General"

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    supplied_categories: Optional[str] = None
    is_active: Optional[bool] = None

class SupplierResponse(BaseModel):
    id: str
    name: str
    contact_person: str
    phone: str
    email: str
    address: str
    supplied_categories: str
    is_active: bool
    created_at: str


# ==============================================================================
# Transaction Models
# ==============================================================================

class PurchaseCreate(BaseModel):
    product_id: str
    supplier_id: str
    quantity: int = Field(..., gt=0)
    unit_cost: float = Field(..., gt=0)
    purchase_date: Optional[str] = None

class PurchaseResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    supplier_id: str
    supplier_name: str
    quantity: int
    unit_cost: float
    total_cost: float
    purchase_date: str
    created_by: str

class SaleCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    sale_date: Optional[str] = None

class SaleResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_revenue: float
    sale_date: str
    created_by: str


# ==============================================================================
# Prediction Models
# ==============================================================================

class PredictionRequest(BaseModel):
    product_id: str
    method: Optional[str] = "exponential_smoothing"  # "moving_average", "weighted_moving_average", "exponential_smoothing"
    forecast_days: Optional[int] = 30
    lead_time_days: Optional[int] = 7
    safety_stock_factor: Optional[float] = 1.65

class PredictionResponse(BaseModel):
    product_id: str
    product_name: str
    method: str
    algorithm_name: str
    historical_days_analyzed: int
    total_historical_sales_units: int
    daily_demand_rate: float
    forecast_horizon_days: int
    lead_time_days: int
    predicted_demand: int
    current_stock: int
    demand_std_dev: float
    safety_stock: int
    recommended_restock: int
    urgency_status: str
    formula_explanation: str
