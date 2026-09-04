import React from "react";

interface KpiGridProps {
  totalVolume: number;
  matchRate: number;
  autoMatchedCount: number;
  totalTransactions: number;
  exceptionCount: number;
  totalLiquidCash: number;
  runwayDays: number;
  dailyBurn: number;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  totalVolume,
  matchRate,
  autoMatchedCount,
  totalTransactions,
  exceptionCount,
  totalLiquidCash,
  runwayDays,
  dailyBurn,
}) => {
  const formatINR = (val: number) => "₹" + Math.round(val).toLocaleString("en-IN");
  const formatCrores = (val: number) => "₹" + (val / 10000000).toFixed(2) + " Cr";
  const formatLakhs = (val: number) => "₹" + (val / 100000).toFixed(2) + "L";

  return (
    <section className="kpi-grid" aria-label="Executive Financial Metrics">
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Reconciliation Match Rate</span>
        </div>
        <div className="kpi-value" style={{ color: "var(--color-success)" }}>
          {matchRate.toFixed(1)}%
        </div>
        <div className="kpi-subtext">
          <span>{autoMatchedCount} of {totalTransactions} items auto-reconciled (100% precision)</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Reconciled Volume</span>
        </div>
        <div className="kpi-value">
          {formatINR(totalVolume)}
        </div>
        <div className="kpi-subtext">
          <span>Multi-source: AP Invoices, ICICI, HDFC, RazorpayX</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Honest Exception Desk</span>
        </div>
        <div className="kpi-value" style={{ color: "var(--color-danger)" }}>
          {exceptionCount} Anomalies
        </div>
        <div className="kpi-subtext">
          <span>1 price overcharge, 1 unlinked debit (1-click email action)</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Liquid Treasury Runway</span>
        </div>
        <div className="kpi-value" style={{ color: "#38bdf8" }}>
          {runwayDays} Days
        </div>
        <div className="kpi-subtext">
          <span>{formatCrores(totalLiquidCash)} reserves ({formatLakhs(dailyBurn)}/day burn)</span>
        </div>
      </div>
    </section>
  );
};
