import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Phone, Mail, MapPin, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { INDIAN_STATES, formatIndianPhone, isValidIndianPhone } from '../../utils/formatters';

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
    state: 'Tamil Nadu',
    pin_code: '632007',
    gstin: '',
    supplied_categories: 'Electrical Components, Hardware'
  });

  const filteredSuppliers = suppliers.filter((s) => {
    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (s.state && s.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      state: 'Tamil Nadu',
      pin_code: '632007',
      gstin: '',
      supplied_categories: 'Electrical Components, Hardware'
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
      state: sup.state || 'Tamil Nadu',
      pin_code: sup.pin_code || '632007',
      gstin: sup.gstin || '',
      supplied_categories: sup.supplied_categories || 'General'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.pin_code && !/^[1-9][0-9]{5}$/.test(formData.pin_code.trim())) {
      setFormError('Please enter a valid 6-digit Indian PIN code (e.g., 632007).');
      return;
    }

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
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search suppliers by name, city, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {user?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Indian Supplier</span>
          </button>
        )}
      </div>

      {/* Suppliers Grid / Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
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
                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatIndianPhone(sup.phone)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="var(--text-muted)" />
                <span>{sup.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={14} color="var(--text-muted)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <span>{sup.address}</span>
              </div>
            </div>

            {/* GSTIN & State Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span className="badge badge-info">
                {sup.state || 'Tamil Nadu'} &bull; PIN: {sup.pin_code || '632007'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                GSTIN: <strong style={{ color: 'var(--text-primary)' }}>{sup.gstin || '33AABCS1234A1Z1'}</strong>
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Supplied:</strong> {sup.supplied_categories}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {editingSupplier ? 'Edit Supplier Profile' : 'Add New Indian Supplier'}
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
                  <label className="form-label">Supplier Business Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sri Lakshmi Industrial Supplies"
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
                    placeholder="e.g. K. Sundaram"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone (+91 Format) *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98421 54321"
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
                      placeholder="orders@srilakshmiind.in"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Address (India) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Plot 42, SIDCO Industrial Estate, Katpadi, Vellore"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">State / UT *</label>
                    <select
                      className="form-select"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      className="form-input"
                      value={formData.pin_code}
                      onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                      placeholder="632007"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">GSTIN (15 Digits)</label>
                    <input
                      type="text"
                      maxLength={15}
                      className="form-input"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      placeholder="33AABCS1234A1Z1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supplied Categories</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.supplied_categories}
                      onChange={(e) => setFormData({ ...formData, supplied_categories: e.target.value })}
                      placeholder="e.g. Electrical Components, Hardware"
                    />
                  </div>
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
