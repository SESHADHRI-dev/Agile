import React from 'react';
import { Sun, Moon, ShieldCheck, UserCheck, Database, LogOut, RefreshCw, KeyRound, Cloud } from 'lucide-react';

export default function Navbar({
  activeTitle,
  alertCount,
  theme,
  toggleTheme,
  onRefresh,
  onLogout,
  authConfig,
  user
}) {
  const isLocalAuth = !authConfig || authConfig.is_local;
  const isLocalStorage = !authConfig || authConfig.storage_mode === 'local';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Auth Mode Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: isLocalAuth ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
          border: `1px solid ${isLocalAuth ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isLocalAuth ? 'var(--success)' : 'var(--accent-primary)'
        }} title={isLocalAuth ? "Running in zero-friction Local Dev Auth mode" : "Secured with Amazon Cognito User Pools"}>
          <KeyRound size={13} />
          <span>AUTH: {isLocalAuth ? 'LOCAL DEV' : 'AWS COGNITO'}</span>
        </div>

        {/* Storage Mode Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#8b5cf6'
        }}>
          {isLocalStorage ? <Database size={13} /> : <Cloud size={13} />}
          <span>DB: {isLocalStorage ? 'LOCAL SQLITE' : 'DYNAMODB'}</span>
        </div>

        {/* Active Role Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: user?.role === 'Admin' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)',
          border: `1px solid ${user?.role === 'Admin' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: user?.role === 'Admin' ? 'var(--accent-primary)' : 'var(--info)'
        }}>
          {user?.role === 'Admin' ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
          <span>{user?.role || 'Admin'}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh All Data"
          style={{ padding: '0.45rem 0.7rem' }}
        >
          <RefreshCw size={14} />
          <span>Sync</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          title="Toggle Dark/Light Mode"
          style={{ padding: '0.45rem' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="btn btn-secondary btn-sm"
          title="Log Out"
          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.45rem 0.7rem' }}
        >
          <LogOut size={14} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}
