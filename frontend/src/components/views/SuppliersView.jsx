import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function SuppliersView({ suppliers = [], onRefresh, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    supplied_categories: 'Electronics, Hardware'
  });

  const filteredSuppliers = suppliers.filter((s) => {
    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      supplied_categories: 'Electronics, Hardware'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contact_person: sup.contact_person,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      supplied_categories: sup.supplied_categories || 'General'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, formData);
      } else {
        await api.createSupplier(formData);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setFormError(err.message || 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to deactivate supplier '${name}'?`)) {
      try {
        await api.deleteSupplier(id);
        onRefresh();
      } catch (err) {
        alert(err.message || 'Error deactivating supplier');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search suppliers by name, contact, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {user?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Suppliers Grid / Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredSuppliers.map((sup) => (
          <div key={sup.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {sup.id}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>{sup.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Contact: {sup.contact_person}
                </span>
              </div>
              {user?.role === 'Admin' && (
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button onClick={() => handleOpenEdit(sup)} className="btn btn-secondary btn-sm" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(sup.id, sup.name)} className="btn btn-danger btn-sm" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="var(--text-muted)" />
                <span>{sup.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="var(--text-muted)" />
                <span>{sup.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="var(--text-muted)" />
                <span>{sup.address}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Supplied:</strong> {sup.supplied_categories}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Electronics Ltd"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Robert Vance"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1-555-0192"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@supplier.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Industrial Parkway, City, State"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Supplied Categories</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.supplied_categories}
                    onChange={(e) => setFormData({ ...formData, supplied_categories: e.target.value })}
                    placeholder="e.g. Electronics, Sensors, Hardware"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
