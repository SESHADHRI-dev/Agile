"""
Unit Tests for Mandatory Inventory Formulas and Domain Invariants
Directly validates all test scenarios specified in agile.md
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.domain import InventoryLogic


def test_mandatory_purchase_case():
    """
    agile.md: 100 stock + 50 purchase = 150
    """
    previous_stock = 100
    purchase_quantity = 50
    new_stock = InventoryLogic.calculate_purchase_stock(previous_stock, purchase_quantity)
    assert new_stock == 150


def test_mandatory_sale_case():
    """
    agile.md: 150 stock − 30 sale = 120
    """
    previous_stock = 150
    sale_quantity = 30
    new_stock = InventoryLogic.calculate_sale_stock(previous_stock, sale_quantity)
    assert new_stock == 120


def test_mandatory_low_stock_case():
    """
    agile.md: 10 stock with minimum 20 = LOW STOCK
    """
    current_stock = 10
    min_stock_level = 20
    status = InventoryLogic.evaluate_stock_status(current_stock, min_stock_level)
    assert status == "LOW STOCK"


def test_mandatory_out_of_stock_case():
    """
    agile.md: 0 stock = OUT OF STOCK
    """
    current_stock = 0
    min_stock_level = 20
    status = InventoryLogic.evaluate_stock_status(current_stock, min_stock_level)
    assert status == "OUT OF STOCK"


def test_mandatory_in_stock_case():
    current_stock = 35
    min_stock_level = 20
    status = InventoryLogic.evaluate_stock_status(current_stock, min_stock_level)
    assert status == "IN STOCK"


def test_mandatory_over_sale_rejection():
    """
    agile.md: 10 stock with sale quantity 15 = REJECT
    """
    current_stock = 10
    sale_quantity = 15
    with pytest.raises(ValueError, match="Insufficient stock"):
        InventoryLogic.calculate_sale_stock(current_stock, sale_quantity)


def test_invalid_negative_quantities():
    with pytest.raises(ValueError, match="must be greater than zero"):
        InventoryLogic.calculate_purchase_stock(100, -5)

    with pytest.raises(ValueError, match="must be greater than zero"):
        InventoryLogic.calculate_sale_stock(100, 0)
