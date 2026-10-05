import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/views/DashboardView';
import ProductsView from './components/views/ProductsView';
import SuppliersView from './components/views/SuppliersView';
import PurchasesView from './components/views/PurchasesView';
import SalesView from './components/views/SalesView';
import InventoryView from './components/views/InventoryView';
import AlertsView from './components/views/AlertsView';
import PredictionView from './components/views/PredictionView';
import RecommendationsView from './components/views/RecommendationsView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import LoginModal from './components/LoginModal';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState(null);

  // Core Data
  const [inventorySummary, setInventorySummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial authentication & configuration handshake
  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Fetch server config (determines if local dev or AWS Cognito)
        const cfg = await api.getAuthConfig().catch(() => ({
          auth_mode: 'local',
          storage_mode: 'local',
          is_local: true,
          default_admin: { username: 'admin@inventory.io', role: 'Admin', name: 'Dr. S. Sharma (Administrator)' }
        }));
        setAuthConfig(cfg);

        // 2. Resolve active user session
        let activeUser = null;
        try {
          activeUser = await api.getProfile();
        } catch (e) {
          // In local dev mode, auto-login with default admin if token expired or missing
          if (cfg.is_local) {
            console.log('[Auth] Initializing local dev session for Administrator...');
            api.setToken('dev-admin-token');
            activeUser = cfg.default_admin;
          }
        }

        if (activeUser) {
          setUser(activeUser);
        }
      } catch (err) {
        console.error('Failed to initialize application:', err);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const refreshAllData = async () => {
    try {
      const [invRes, prodRes, supRes, purRes, salRes, altRes] = await Promise.all([
        api.getInventory().catch(err => { console.error('Inventory error:', err); return null; }),
        api.getProducts().catch(err => { console.error('Products error:', err); return { data: [] }; }),
        api.getSuppliers().catch(err => { console.error('Suppliers error:', err); return { data: [] }; }),
        api.getPurchases().catch(err => { console.error('Purchases error:', err); return { data: [] }; }),
        api.getSales().catch(err => { console.error('Sales error:', err); return { data: [] }; }),
        api.getAlerts().catch(err => { console.error('Alerts error:', err); return { data: [] }; })
      ]);

      if (invRes) setInventorySummary(invRes);
      if (prodRes && prodRes.data) setProducts(prodRes.data);
      if (supRes && supRes.data) setSuppliers(supRes.data);
      if (purRes && purRes.data) setPurchases(purRes.data);
      if (salRes && salRes.data) setSales(salRes.data);
      if (altRes && altRes.data) setAlerts(altRes.data);
    } catch (err) {
      console.error('Error syncing app data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    api.logout();
    if (authConfig?.is_local) {
      // In local mode, immediately offer login modal or reset
      setUser(null);
    } else {
      setUser(null);
    }
  };

  const handleSwitchUser = async (email) => {
    try {
      const res = await api.login(email, 'Password123!');
      setUser(res.user);
      api.setToken(res.token);
      refreshAllData();
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const tabTitles = {
    dashboard: 'Executive Dashboard & Inventory Intelligence',
    inventory: 'Central Warehouse Inventory Ledger',
    products: 'Product Catalog & SKU Management',
    suppliers: 'Supplier Directory & Contacts',
    purchases: 'Inbound Procurement & Restock Orders',
    sales: 'Customer Orders & Demand Log',
    alerts: 'Active Stockout & Deficit Warning Center',
    prediction: 'Statistical Demand Forecasting Engine',
    recommendations: 'Prioritized Procurement Order Sheet',
    reports: 'Audit Reports & Data Export Center',
    settings: 'Configuration & Academic Evaluation Settings'
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Initializing IntelliStock System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!user && <LoginModal onLoginSuccess={(u) => { setUser(u); refreshAllData(); }} />}

      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.length}
        user={user}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="main-content">
        <Navbar
          activeTitle={tabTitles[activeTab] || 'Dashboard'}
          alertCount={alerts.length}
          theme={theme}
          toggleTheme={toggleTheme}
          onRefresh={refreshAllData}
          onLogout={handleLogout}
          authConfig={authConfig}
          user={user}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardView
              inventorySummary={inventorySummary}
              recentSales={sales}
              recentPurchases={purchases}
              alerts={alerts}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              suppliers={suppliers}
              onRefresh={refreshAllData}
              user={user}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              onRefresh={refreshAllData}
              user={user}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              products={products}
              suppliers={suppliers}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              sales={sales}
              products={products}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              inventorySummary={inventorySummary}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'prediction' && (
            <PredictionView
              products={products}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onSwitchUser={handleSwitchUser}
              onRefreshAll={refreshAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
