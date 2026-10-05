import React from 'react';
import { Sun, Moon, Bell, Cloud, Database, LogOut, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTitle, alertCount, theme, toggleTheme, onRefresh, onLogout }) {
  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Title & Breadcrumbs */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {activeTitle}
        </h1>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Cloud Inventory & Stock Prediction System &bull; <span style={{ color: 'var(--accent-primary)' }}>Active Session</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Storage Mode Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--accent-primary)'
        }}>
          <Database size={14} />
          <span>Storage: Local Dual-Mode</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh All Data"
          style={{ padding: '0.5rem 0.75rem' }}
        >
          <RefreshCw size={15} />
          <span>Sync</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          title="Toggle Dark/Light Mode"
          style={{ padding: '0.5rem' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="btn btn-secondary btn-sm"
          title="Log Out"
          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <LogOut size={15} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}
