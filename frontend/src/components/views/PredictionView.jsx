import React, { useState, useEffect } from 'react';
import { BrainCircuit, Play, ArrowRight, CheckCircle2, ShoppingBag, Info, Sliders } from 'lucide-react';
import { api } from '../../api';

export default function PredictionView({ products = [], onNavigate }) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'PRD-1001');
  const [method, setMethod] = useState('exponential_smoothing');
  const [forecastDays, setForecastDays] = useState(30);
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [safetyFactor, setSafetyFactor] = useState(1.65);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Auto-run first prediction on mount
  useEffect(() => {
    if (products.length > 0) {
      handleCalculate(products[0].id);
    }
  }, [products]);

  const handleCalculate = async (prodId = selectedProductId) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.calculatePrediction({
        product_id: prodId,
        method: method,
        forecast_days: parseInt(forecastDays, 10),
        lead_time_days: parseInt(leadTimeDays, 10),
        safety_stock_factor: parseFloat(safetyFactor)
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error executing demand prediction algorithm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Intelligent Demand Forecasting Engine</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Ingests historical sales time-series from DynamoDB, calculates daily demand velocity, estimates lead-time safety stock, and optimizes replenishment orders.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Sliders size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Forecasting Parameters & Model Selection</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Product Select */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Product</label>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                handleCalculate(e.target.value);
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — Stock: {p.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Algorithm Select */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Forecasting Algorithm</label>
            <select
              className="form-select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="exponential_smoothing">Single Exponential Smoothing (SES, &alpha;=0.3)</option>
              <option value="weighted_moving_average">Weighted Moving Average (WMA, Recency Bias)</option>
              <option value="moving_average">Simple Moving Average (SMA, 14-day window)</option>
            </select>
          </div>

          {/* Forecast Horizon */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Forecast Horizon (Days)</label>
            <input
              type="number"
              min="7"
              max="90"
              className="form-input"
              value={forecastDays}
              onChange={(e) => setForecastDays(e.target.value)}
            />
          </div>

          {/* Supplier Lead Time */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Supplier Lead Time (Days)</label>
            <input
              type="number"
              min="1"
              max="60"
              className="form-input"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleCalculate(selectedProductId)}
            disabled={loading}
            className="btn btn-primary"
          >
            <Play size={16} />
            <span>{loading ? 'Executing ML Pipeline...' : 'Run Demand Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Output Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* Card: Predicted Demand */}
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PROJECTED DEMAND</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-primary)' }}>
                {result.predicted_demand} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>units</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Over {result.forecast_horizon_days} days &bull; Velocity: {result.daily_demand_rate}/day
              </div>
            </div>

            {/* Card: Current Stock */}
            <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CURRENT PHYSICAL STOCK</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {result.current_stock} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>units</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Warehouse verified balance
              </div>
            </div>

            {/* Card: Safety Stock */}
            <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>BUFFER SAFETY STOCK</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--warning)' }}>
                {result.safety_stock} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>units</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Z=1.65 (95% Service Level) &bull; Lead time: {result.lead_time_days}d
              </div>
            </div>

            {/* Card: Recommended Restock */}
            <div className="glass-card" style={{
              borderLeft: '4px solid var(--success)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
              padding: '1.25rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>RECOMMENDED RESTOCK ORDER</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--success)' }}>
                {result.recommended_restock} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>units</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Status: <span className="badge badge-in-stock">{result.urgency_status}</span>
              </div>
            </div>
          </div>

          {/* Mathematical Proof & Academic Explanation Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Info size={18} color="var(--info)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Statistical Derivation & Formula Breakdown</h4>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: '#38bdf8',
              lineHeight: 1.7
            }}>
              <div><strong>Model Selected:</strong> {result.algorithm_name}</div>
              <div><strong>Historical Dataset:</strong> {result.historical_days_analyzed} days analyzed &bull; {result.total_historical_sales_units} units sold</div>
              <div><strong>Daily Demand Velocity:</strong> {result.daily_demand_rate} units/day</div>
              <div><strong>Lead-Time Variance (&sigma;):</strong> {result.demand_std_dev}</div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {result.formula_explanation}
              </div>
            </div>

            {result.recommended_restock > 0 && (
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onNavigate('purchases')}
                  className="btn btn-primary"
                >
                  <ShoppingBag size={16} />
                  <span>Create Purchase Order for {result.recommended_restock} Units</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
