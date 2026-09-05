import React from "react";

interface HeaderProps {
  activeTab: "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot";
  onSelectTab: (tab: "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot") => void;
  matchCount: number;
  exceptionCount: number;
  runwayDays: number;
  throughputTps: number;
  isStreaming?: boolean;
  onToggleStream?: () => void;
  onRunBatchIngestion?: () => void;
  isIngesting?: boolean;
  lastStreamEvent?: {
    vendor: string;
    utr: string;
    amount: number;
    latencyMs: number;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  matchCount,
  exceptionCount,
  runwayDays,
  throughputTps,
  isStreaming = false,
  onToggleStream,
  onRunBatchIngestion,
  isIngesting = false,
  lastStreamEvent,
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

        <div className="header-telemetry" style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          {/* Subtle Live Stream Status Pill (Only shows when stream is running, no popups) */}
          {isStreaming && lastStreamEvent && (
            <div
              className="status-pill"
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#6ee7b7",
                fontSize: "0.75rem",
              }}
              title="Real-time incoming bank debit auto-matched"
            >
              <span className="pulse-dot" style={{ backgroundColor: "#10b981" }} aria-hidden="true" />
              <span>
                Stream: {lastStreamEvent.vendor} (+₹{lastStreamEvent.amount.toLocaleString("en-IN")}) • {lastStreamEvent.latencyMs}ms
              </span>
            </div>
          )}

          {/* Action Controls */}
          {onRunBatchIngestion && (
            <button
              className="btn-primary"
              onClick={onRunBatchIngestion}
              disabled={isIngesting}
              style={{
                fontSize: "0.775rem",
                padding: "0.35rem 0.75rem",
                backgroundColor: isIngesting ? "var(--bg-surface)" : "var(--color-brand)",
                cursor: isIngesting ? "wait" : "pointer",
              }}
              title="Trigger real-time execution of the 7-stage reconciliation engine"
            >
              {isIngesting ? "⚡ Reconciling..." : "▶ Re-Run Ingestion"}
            </button>
          )}

          {onToggleStream && (
            <button
              className={isStreaming ? "btn-danger" : "btn-secondary"}
              onClick={onToggleStream}
              style={{
                fontSize: "0.775rem",
                padding: "0.35rem 0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              title="Simulate live incoming bank debits and Razorpay settlements"
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: isStreaming ? "#ef4444" : "#10b981",
                  display: "inline-block",
                  animation: isStreaming ? "pulse 1.5s infinite" : "none",
                }}
              />
              {isStreaming ? "Pause Live Feed" : "🔴 Live Stream Simulator"}
            </button>
          )}

          <div className="status-pill" title="Live Engine Telemetry">
            <span className="pulse-dot" aria-hidden="true" />
            <span>{matchCount + exceptionCount} Records • 100% Precision • &lt;20ms</span>
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
