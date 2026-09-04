import React, { useState } from "react";
import type { TreasuryState } from "../types";

interface TreasuryRunwayProps {
  treasury: TreasuryState;
}

export const TreasuryRunway: React.FC<TreasuryRunwayProps> = ({ treasury }) => {
  const [vendorShockPercent, setVendorShockPercent] = useState<number>(0);
  const [settlementDelayDays, setSettlementDelayDays] = useState<number>(0);

  const formatINR = (val: number) => "₹" + Math.round(val).toLocaleString("en-IN");
  const formatCrores = (val: number) => "₹" + (val / 10000000).toFixed(2) + " Cr";

  // Recalculate dynamic burn rate and runway based on shock sliders
  const adjustedDailyBurn = treasury.dailyBurnRate * (1 + vendorShockPercent / 100);
  const adjustedTotalCash = Math.max(0, treasury.totalLiquidCash - settlementDelayDays * 400000);
  const adjustedRunwayDays = Math.max(1, Math.floor(adjustedTotalCash / adjustedDailyBurn));

  // Generate SVG points for the runway curve
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };

  const maxCash = treasury.totalLiquidCash * 1.05;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const points = treasury.runwayCurve.map((pt, idx) => {
    const x = padding.left + (idx / (treasury.runwayCurve.length - 1)) * chartWidth;
    // Calculate projected cash with shock
    const currentCash = Math.max(0, adjustedTotalCash - adjustedDailyBurn * pt.day);
    const y = padding.top + (1 - currentCash / maxCash) * chartHeight;
    return { x, y, day: pt.day, cash: currentCash, date: pt.date };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x} ${svgHeight - padding.bottom} L ${padding.left} ${svgHeight - padding.bottom} Z`;

  return (
    <section className="card-section" aria-label="Treasury & Forward Cash Runway">
      <div className="section-header-bar">
        <div>
          <h2 className="section-heading">Forward Cash Forecaster & Treasury Runway</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            30-day liquidity simulation across all corporate bank feeds and settlement accounts
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div className="status-pill">
            <span>Net Liquid Cash:</span>
            <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
              {formatCrores(adjustedTotalCash)}
            </strong>
          </div>
          <div className="status-pill">
            <span>Projected Runway:</span>
            <strong style={{ color: adjustedRunwayDays < 60 ? "var(--color-warning)" : "var(--color-success)" }}>
              {adjustedRunwayDays} Days
            </strong>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="chart-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
          aria-label="30-day cash runway burn projection graph"
        >
          <defs>
            <linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c54ea" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0c54ea" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * chartHeight;
            const val = maxCash * (1 - ratio);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {formatCrores(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#runwayGradient)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {points.filter((_, idx) => idx % 5 === 0 || idx === points.length - 1).map((pt, idx) => (
            <g key={idx}>
              <circle cx={pt.x} cy={pt.y} r="4" fill="#0c54ea" stroke="#ffffff" strokeWidth="2" />
              <text
                x={pt.x}
                y={svgHeight - padding.bottom + 18}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                Day {pt.day}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Scenario Shock Modeling Controls */}
      <div style={{ background: "var(--bg-surface)", padding: "1.25rem", borderRadius: "8px", marginTop: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#ffffff" }}>
          Dynamic Runway Shock Simulator (What-If Analysis)
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.85rem" }}>
              <label htmlFor="vendor-shock">Cloud & Vendor Cost Spike:</label>
              <strong style={{ color: "var(--color-warning)", fontFamily: "var(--font-mono)" }}>
                +{vendorShockPercent}% (₹{formatINR(adjustedDailyBurn)}/day)
              </strong>
            </div>
            <input
              id="vendor-shock"
              type="range"
              min="0"
              max="50"
              step="5"
              value={vendorShockPercent}
              onChange={(e) => setVendorShockPercent(parseInt(e.target.value, 10))}
              style={{ width: "100%", accentColor: "var(--color-brand)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.85rem" }}>
              <label htmlFor="delay-shock">Gateway Settlement Hold:</label>
              <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                {settlementDelayDays} Days Hold
              </strong>
            </div>
            <input
              id="delay-shock"
              type="range"
              min="0"
              max="10"
              step="1"
              value={settlementDelayDays}
              onChange={(e) => setSettlementDelayDays(parseInt(e.target.value, 10))}
              style={{ width: "100%", accentColor: "var(--color-brand)" }}
            />
          </div>
        </div>

        {vendorShockPercent > 0 && (
          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#fbbf24" }}>
            Under a +{vendorShockPercent}% cost spike, cash runway drops by{" "}
            <strong>{treasury.projectedRunwayDays - adjustedRunwayDays} days</strong> (to {adjustedRunwayDays} days).
          </div>
        )}
      </div>

      {/* Corporate Bank Feeds Breakdown */}
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>
        Multi-Source Corporate Treasury Accounts
      </h3>
      <div className="accounts-grid">
        {treasury.accounts.map((acc) => (
          <div key={acc.accountNumber} className="account-card">
            <div className="account-card-name">{acc.name}</div>
            <div className="account-card-balance">{formatINR(acc.balance)}</div>
            <div className="font-mono" style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              A/C: {acc.accountNumber}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
