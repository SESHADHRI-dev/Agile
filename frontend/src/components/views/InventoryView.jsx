import React, { useState } from 'react';
import { Package, Search, Filter, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function InventoryView({ products = [], inventorySummary }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    total_products = 0,
    total_units = 0,
    total_inventory_value = 0,
    low_stock_count = 0,
    out_of_stock_count = 0
  } = inventorySummary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL ASSETS HELD</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${total_inventory_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL QUANTITY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total_units.toLocaleString()} units</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)' }}>LOW STOCK ITEMS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>{low_stock_count}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>OUT OF STOCK</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{out_of_stock_count}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU / ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Stock Status</th>
              <th>Unit Price</th>
              <th>Total Valuation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              let badge = 'badge-in-stock';
              if (item.status === 'LOW STOCK') badge = 'badge-low-stock';
              if (item.status === 'OUT OF STOCK') badge = 'badge-out-of-stock';
              const valuation = item.quantity * item.price;

              return (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.id}
                  </td>
                  <td style={{ fontWeight: 700 }}>{item.name}</td>
                  <td><span className="badge badge-info">{item.category}</span></td>
                  <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.quantity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.min_stock_level}</td>
                  <td><span className={`badge ${badge}`}>{item.status}</span></td>
                  <td>${item.price.toFixed(2)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${valuation.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
