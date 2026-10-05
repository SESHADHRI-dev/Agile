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
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

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

  // Initial user check
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      api.getProfile()
        .then(setUser)
        .catch(() => {
          // Default to local admin if dev mode
          setUser({ id: 'USR-ADM-001', username: 'admin@inventory.io', role: 'Admin', name: 'Dr. S. Sharma (Administrator)' });
        })
        .finally(() => setLoading(false));
    } else {
      // Auto-assign mock admin in local dev for fast demo
      setUser({ id: 'USR-ADM-001', username: 'admin@inventory.io', role: 'Admin', name: 'Dr. S. Sharma (Administrator)' });
      setLoading(false);
    }
  }, []);

  const refreshAllData = async () => {
    try {
      const [invRes, prodRes, supRes, purRes, salRes, altRes] = await Promise.all([
        api.getInventory().catch(() => null),
        api.getProducts().catch(() => ({ data: [] })),
        api.getSuppliers().catch(() => ({ data: [] })),
        api.getPurchases().catch(() => ({ data: [] })),
        api.getSales().catch(() => ({ data: [] })),
        api.getAlerts().catch(() => ({ data: [] }))
      ]);

      if (invRes) setInventorySummary(invRes);
      if (prodRes) setProducts(prodRes.data || []);
      if (supRes) setSuppliers(supRes.data || []);
      if (purRes) setPurchases(purRes.data || []);
      if (salRes) setSales(salRes.data || []);
      if (altRes) setAlerts(altRes.data || []);
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
    setUser(null);
  };

  const handleSwitchUser = async (email) => {
    try {
      const res = await api.login(email, 'Password123!');
      setUser(res.user);
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
          Initializing IntelliStock System...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!user && <LoginModal onLoginSuccess={setUser} />}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.length}
        user={user}
      />

      <div className="main-content">
        <Navbar
          activeTitle={tabTitles[activeTab] || 'Dashboard'}
          alertCount={alerts.length}
          theme={theme}
          toggleTheme={toggleTheme}
          onRefresh={refreshAllData}
          onLogout={handleLogout}
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
