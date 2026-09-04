import React from "react";

interface HeaderProps {
  activeTab: "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot";
  onSelectTab: (tab: "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot") => void;
  matchCount: number;
  exceptionCount: number;
  runwayDays: number;
  throughputTps: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  matchCount,
  exceptionCount,
  runwayDays,
  throughputTps,
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-logo-badge">RZ</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 className="brand-title">RazorTerminal</h1>
              <span className="brand-track-tag">Track 04: AI Finance Controller & Treasury Workstation</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Automated 3-Way Matching: Bank Debits vs AP Invoices vs Razorpay Settlements
            </p>
          </div>
        </div>

        <div className="header-telemetry">
          <div className="status-pill" title="Live Engine Telemetry">
            <span className="pulse-dot" aria-hidden="true"></span>
            <span>52-Record Batch • 96.2% Match Rate • 100% Precision • &lt;20ms Latency</span>
          </div>
        </div>
      </div>

      <nav className="header-nav" aria-label="Main Navigation">
        <button
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => onSelectTab("dashboard")}
        >
          <span>Overview</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "reconciliation" ? "active" : ""}`}
          onClick={() => onSelectTab("reconciliation")}
        >
          <span>Reconciliation</span>
          <span className="tab-badge">{matchCount} matched</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "exceptions" ? "active" : ""}`}
          onClick={() => onSelectTab("exceptions")}
        >
          <span>Exception Desk</span>
          <span className="tab-badge" style={{ backgroundColor: "rgba(239, 68, 68, 0.4)", color: "#fca5a5" }}>
            {exceptionCount} flagged
          </span>
        </button>

        <button
          className={`nav-tab ${activeTab === "treasury" ? "active" : ""}`}
          onClick={() => onSelectTab("treasury")}
        >
          <span>Treasury</span>
          <span className="tab-badge">{runwayDays}d runway</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "copilot" ? "active" : ""}`}
          onClick={() => onSelectTab("copilot")}
        >
          <span>Copilot</span>
        </button>
      </nav>
    </header>
  );
};
