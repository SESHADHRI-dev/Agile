import React, { useState, useEffect } from 'react';
import { FileText, Download, Cloud, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../../api';

export default function ReportsView() {
  const [summary, setSummary] = useState(null);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    api.getReportsSummary().then(setSummary).catch(console.error);
  }, []);

  const handleDownload = async (reportType) => {
    setDownloading(reportType);
    try {
      const blob = await api.downloadReport(reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to download report');
    } finally {
      setDownloading('');
    }
  };

  const reportsList = [
    {
      id: 'inventory',
      title: 'Current Inventory Valuation Report',
      description: 'Comprehensive audit of all warehouse SKUs, holding values, and current stock status.',
      filename: 'report_inventory_*.csv'
    },
    {
      id: 'low_stock',
      title: 'Low-Stock & Deficit Alert Audit',
      description: 'Isolates all products whose current balance is at or below minimum threshold.',
      filename: 'report_low_stock_*.csv'
    },
    {
      id: 'sales',
      title: 'Historical Sales Transaction Ledger',
      description: 'Complete record of customer transactions used to train demand forecasting models.',
      filename: 'report_sales_*.csv'
    },
    {
      id: 'purchases',
      title: 'Supplier Purchase & Inbound Ledger',
      description: 'Inbound replenishment batches, supplier references, and unit acquisition costs.',
      filename: 'report_purchases_*.csv'
    },
    {
      id: 'predictions',
      title: 'Demand Prediction & Restock Analysis',
      description: 'Forecasting output, estimated safety stocks, and recommended replenishment quantities.',
      filename: 'report_predictions_*.csv'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Audit Reports & Data Export Center</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Export tabular audit datasets as CSV for Excel/BI analysis or cloud synchronization to Amazon S3.
        </p>
      </div>

      {/* KPI Overview */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL REVENUE LOGGED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
              ${summary.total_sales_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PROCUREMENT SPEND</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              ${summary.total_purchase_spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT ASSET VALUATION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              ${summary.total_inventory_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.25rem'
      }}>
        {reportsList.map((rep) => (
          <div key={rep.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  padding: '0.4rem',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--accent-primary)'
                }}>
                  <FileText size={18} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{rep.title}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {rep.description}
              </p>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.725rem',
                color: 'var(--text-muted)',
                marginTop: '0.75rem'
              }}>
                Format: {rep.filename}
              </div>
            </div>

            <button
              onClick={() => handleDownload(rep.id)}
              disabled={downloading === rep.id}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <Download size={15} />
              <span>{downloading === rep.id ? 'Generating CSV...' : 'Download CSV Export'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
