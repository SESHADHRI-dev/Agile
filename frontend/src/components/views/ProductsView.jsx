import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function ProductsView({ products = [], suppliers = [], onRefresh, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    quantity: '',
    min_stock_level: '',
    supplier_id: ''
  });

  const categories = ['ALL', 'Electronics', 'Sensors', 'Hydraulics', 'Power Supplies', 'Hardware'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Electronics',
      price: '',
      quantity: '',
      min_stock_level: '',
      supplier_id: suppliers[0]?.id || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      quantity: prod.quantity,
      min_stock_level: prod.min_stock_level,
      supplier_id: prod.supplier_id || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        min_stock_level: parseInt(formData.min_stock_level, 10),
        supplier_id: formData.supplier_id || undefined
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to deactivate product '${name}'?`)) {
      try {
        await api.deleteProduct(id);
        onRefresh();
      } catch (err) {
        alert(err.message || 'Error deactivating product');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by name or product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="form-select"
            style={{ maxWidth: '200px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {user?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Supplier</th>
              {user?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              let badgeClass = 'badge-in-stock';
              if (p.status === 'LOW STOCK') badgeClass = 'badge-low-stock';
              if (p.status === 'OUT OF STOCK') badgeClass = 'badge-out-of-stock';

              return (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.id}
                  </td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td style={{ fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                  <td style={{ fontWeight: 700 }}>{p.quantity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.min_stock_level}</td>
                  <td><span className={`badge ${badgeClass}`}>{p.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.supplier_name || '—'}</td>
                  {user?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-danger btn-sm"
                          title="Deactivate Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'Admin' ? 9 : 8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No products found matching your search and filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Industrial IoT Sensor Hub"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'ALL').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Initial Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-input"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Min Stock Level *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-input"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Supplier</label>
                  <select
                    className="form-select"
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.contact_person})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
