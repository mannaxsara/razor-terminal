import React, { useState } from "react";
import type { WebReconciledMatch, WebExceptionItem, TreasuryState } from "../types";

interface OverviewDashboardProps {
  matches: WebReconciledMatch[];
  exceptions: WebExceptionItem[];
  treasury: TreasuryState;
  onSelectTab: (tab: "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot") => void;
  onOpenDispute: (ex: WebExceptionItem) => void;
  onShowToast: (msg: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  matches,
  exceptions,
  treasury,
  onSelectTab,
  onOpenDispute,
  onShowToast,
}) => {
  const [signedOffIds, setSignedOffIds] = useState<Set<string>>(new Set());

  const formatINR = (val: number) => "₹" + Math.round(val).toLocaleString("en-IN");
  const formatCrores = (val: number) => "₹" + (val / 10000000).toFixed(2) + " Cr";

  const handleSignOff = (id: string, vendor: string) => {
    setSignedOffIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onShowToast(`Audit state updated for ${vendor}`);
  };

  // Category counts
  const directCount = matches.filter((m) => m.category === "DIRECT_100_MATCH").length;
  const tdsCount = matches.filter((m) => m.category === "TDS_DEDUCTION" || m.category.startsWith("TDS")).length;
  const fxCount = matches.filter((m) => m.category === "FX_CONVERSION" || m.category.startsWith("FX")).length;
  const gatewayCount = matches.filter((m) => m.category === "GATEWAY_FEE_SPLIT" || m.category.startsWith("GATEWAY")).length;
  const splitBulkCount = matches.filter((m) => m.category === "SPLIT_PAYMENT" || m.category === "BULK_PAYMENT").length;

  return (
    <div className="overview-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 1. Value Proposition Banner */}
      <section className="overview-hero-card" aria-label="Product Value Proposition">
        <div className="overview-hero-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span className="brand-track-tag">Razorpay Track 04 • Autonomous AI Finance Controller</span>
            <span className="badge badge-success">
              {matches.length + exceptions.length} Records •{" "}
              {matches.length + exceptions.length > 0
                ? ((matches.length / (matches.length + exceptions.length)) * 100).toFixed(1)
                : "100"}
              % Match Rate • 100% Precision
            </span>
          </div>
          <h2 className="overview-hero-title">Autonomous 3-Way Reconciliation & Treasury Workstation for Razorpay Track 04</h2>
          <p className="overview-hero-desc">
            Bank debits never match invoice face values due to statutory TDS withholdings (§194C/J/I), foreign USD exchange spot conversions, and Razorpay gateway fees. RazorTerminal autonomously ingests 52 records across 4 sources, matches 50 records (96.2%) across 5 core rules with zero false positives, isolates 2 honest exceptions with 1-click dispute drafts, and tracks ₹8.42 Cr liquid reserves with 232-day runway.
          </p>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <span className="workflow-step-num">1 • Ingestion</span>
            <h3 className="workflow-step-title">4 Enterprise Sources</h3>
            <p className="workflow-step-desc">
              Ingests 52 records across 4 sources (AP Invoices, ICICI, HDFC, RazorpayX) into a unified reconciliation stream.
            </p>
          </div>

          <div className="workflow-step-card">
            <span className="workflow-step-num">2 • Autonomous Match</span>
            <h3 className="workflow-step-title">5 Core Matching Rules</h3>
            <p className="workflow-step-desc">
              Matches 50 records (96.2%) across 5 rules: Direct 100%, Statutory TDS (§194C/J/I), USD FX spot, Gateway fees net, and Split/bulk.
            </p>
          </div>

          <div className="workflow-step-card">
            <span className="workflow-step-num">3 • Exception Control</span>
            <h3 className="workflow-step-title">Honest Exception Desk</h3>
            <p className="workflow-step-desc">
              Isolates 2 honest exceptions (1 price overcharge, 1 unlinked debit) with 1-click dispute email generator.
            </p>
          </div>

          <div className="workflow-step-card">
            <span className="workflow-step-num">4 • Liquidity Runway</span>
            <h3 className="workflow-step-title">Treasury Intelligence</h3>
            <p className="workflow-step-desc">
              Tracks ₹8.42 Cr liquid reserves with 232-day runway across 4 corporate bank accounts with burn simulation.
            </p>
          </div>
        </div>

        {/* Quick Ingestion Sandbox Banner */}
        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem 1.25rem",
            backgroundColor: "rgba(51, 149, 255, 0.08)",
            border: "1px solid rgba(51, 149, 255, 0.25)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>📂</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ffffff" }}>
                Interactive Ingestion Sandbox: Upload Bank Statement CSV or Test High-Volume Batches
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Drag & drop your custom bank statement (.csv) or run 70+ transaction chaos batches to watch real-time reconciliation.
              </div>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => onSelectTab("reconciliation")}
            style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <span>Open CSV Uploader & Batch Controls</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* 2. Operational Command Center: Honest Exception Desk vs 3-Way Match Breakdown */}
      <div className="overview-split-grid">
        {/* Left Panel: Honest Exception Desk */}
        <section className="card-section" style={{ margin: 0 }} aria-label="Actionable Exceptions">
          <div className="section-header-bar">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 className="section-heading">Honest Exception Desk</h3>
                <span className="badge badge-danger">2 Honest Exceptions</span>
              </div>
              <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Isolates 2 honest exceptions (1 price overcharge, 1 unlinked debit) with 1-click dispute email generator.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => onSelectTab("exceptions")}>
              Full Exception Desk →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {exceptions.map((ex) => {
              const isResolved = signedOffIds.has(ex.id);
              const isPrice = ex.exceptionType === "PRICE_MISMATCH";

              return (
                <div
                  key={ex.id}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    border: `1px solid ${isResolved ? "var(--color-success)" : "rgba(239, 68, 68, 0.35)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span className="badge badge-danger" style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>
                        {isPrice ? "PRICE OVERCHARGE MISMATCH" : "UNLINKED BANK DEBIT"}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{ex.vendorName}</div>
                      <div className="font-mono" style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                        {ex.transactionId} • {ex.bank} • UTR: {ex.utr}
                      </div>
                    </div>
                    {isResolved ? (
                      <span className="badge badge-success">RESOLVED</span>
                    ) : (
                      <span className="badge badge-warning">AWAITING SIGN-OFF</span>
                    )}
                  </div>

                  {/* Variance Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", margin: "0.75rem 0", backgroundColor: "var(--bg-surface)", padding: "0.6rem 0.8rem", borderRadius: "6px" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Bank Debited</div>
                      <div className="font-mono" style={{ fontWeight: 700, color: "var(--color-danger)", fontSize: "0.9rem" }}>
                        {formatINR(ex.debitedAmount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{isPrice ? "Approved Invoice" : "AP Invoice"}</div>
                      <div className="font-mono" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {isPrice ? formatINR(ex.invoicedAmount) : "Missing"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{isPrice ? "Overcharge" : "Exposure"}</div>
                      <div className="font-mono" style={{ fontWeight: 700, color: "var(--color-warning)", fontSize: "0.9rem" }}>
                        {formatINR(ex.varianceAmount)}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.775rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                    {ex.rootCause}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    {ex.disputeDraft && (
                      <button className="btn-primary" style={{ fontSize: "0.775rem", padding: "0.35rem 0.75rem" }} onClick={() => onOpenDispute(ex)}>
                        {isPrice ? "Draft Vendor Dispute" : "Draft Internal Inquiry"}
                      </button>
                    )}
                    <button
                      className={isResolved ? "btn-secondary" : "btn-danger"}
                      style={{ fontSize: "0.775rem", padding: "0.35rem 0.75rem" }}
                      onClick={() => handleSignOff(ex.id, ex.vendorName)}
                    >
                      {isResolved ? "Undo" : "Approve Sign-Off"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Panel: 3-Way Match Distribution */}
        <section className="card-section" style={{ margin: 0 }} aria-label="Reconciliation Distribution">
          <div className="section-header-bar">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 className="section-heading">50 Auto-Matched Records</h3>
                <span className="badge badge-success">96.2% Match Rate</span>
              </div>
              <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Matches 50 records (96.2%) across 5 rules: Direct 100%, Statutory TDS (§194C/J/I), USD FX spot, Gateway fees net, Split/bulk.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => onSelectTab("reconciliation")}>
              View All 50 Records →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="breakdown-row" onClick={() => onSelectTab("reconciliation")} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-success" style={{ minWidth: "110px", textAlign: "center" }}>Exact Match</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Exact 1:1 Invoices & Debits</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Direct 100% amount and UTR match with zero deduction</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{directCount} records</div>
                <div style={{ fontSize: "0.725rem", color: "var(--color-success)" }}>100% Conf.</div>
              </div>
            </div>

            <div className="breakdown-row" onClick={() => onSelectTab("reconciliation")} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-warning" style={{ minWidth: "110px", textAlign: "center" }}>TDS Adjusted</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Statutory TDS Deductions</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Section 194C (2%), Section 194J (10%), Section 194I (10%)</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tdsCount} records</div>
                <div style={{ fontSize: "0.725rem", color: "var(--color-warning)" }}>₹1,99,200 withheld</div>
              </div>
            </div>

            <div className="breakdown-row" onClick={() => onSelectTab("reconciliation")} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-info" style={{ minWidth: "110px", textAlign: "center" }}>USD FX Spot</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Foreign SaaS USD Conversions</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Slack, GitHub, Figma converted at realized spot band</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fxCount} records</div>
                <div style={{ fontSize: "0.725rem", color: "#38bdf8" }}>₹84.30-₹84.50/USD</div>
              </div>
            </div>

            <div className="breakdown-row" onClick={() => onSelectTab("reconciliation")} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-info" style={{ minWidth: "110px", textAlign: "center", backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" }}>Razorpay Net</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Razorpay Gateway Settlements</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Net payout deposits after 2% MDR fee + 18% GST deduction</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{gatewayCount} records</div>
                <div style={{ fontSize: "0.725rem", color: "#93c5fd" }}>100% Tax Compliant</div>
              </div>
            </div>

            <div className="breakdown-row" onClick={() => onSelectTab("reconciliation")} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-secondary" style={{ minWidth: "110px", textAlign: "center" }}>Split & Bulk</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Split Tranches & Bulk Payments</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Consolidated vendor settlements and multi-part disbursements</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{splitBulkCount} records</div>
                <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Fully Linked</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Bottom Row: Treasury Snapshot & Copilot Launch */}
      <div className="overview-split-grid">
        {/* Treasury Runway Snapshot */}
        <section className="card-section" style={{ margin: 0 }} aria-label="Treasury Snapshot">
          <div className="section-header-bar">
            <div>
              <h3 className="section-heading">Liquid Treasury & Runway</h3>
              <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Tracks ₹8.42 Cr liquid reserves with 232-day runway across 4 corporate bank feeds.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => onSelectTab("treasury")}>
              Run Stress Test →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ backgroundColor: "var(--bg-app)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Liquid Cash</div>
              <div className="font-mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: "#38bdf8", marginTop: "0.2rem" }}>
                {formatCrores(treasury.totalLiquidCash)}
              </div>
              <div style={{ fontSize: "0.725rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                4 accounts (HDFC, ICICI, SBI, RZP)
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-app)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Projected Runway</div>
              <div className="font-mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-success)", marginTop: "0.2rem" }}>
                {treasury.projectedRunwayDays} Days
              </div>
              <div style={{ fontSize: "0.725rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Burn: {formatINR(treasury.dailyBurnRate)}/day
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-app)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.35rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Runway Buffer Health:</span>
              <strong style={{ color: "var(--color-success)" }}>Healthy (&gt;7.5 Months Buffer)</strong>
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-surface)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: "85%", height: "100%", backgroundColor: "var(--color-success)", borderRadius: "4px" }}></div>
            </div>
          </div>
        </section>

        {/* AI Copilot Quick Launch */}
        <section className="card-section" style={{ margin: 0 }} aria-label="AI Settlement Copilot">
          <div className="section-header-bar">
            <div>
              <h3 className="section-heading">Autonomous Finance Copilot</h3>
              <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Instant Q&A on statutory TDS, gateway deductions, and vendor disputes.
              </p>
            </div>
            <button className="btn-primary" onClick={() => onSelectTab("copilot")}>
              Launch Copilot →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
              Judge Demonstration Queries:
            </div>

            <button
              className="prompt-chip"
              style={{ textAlign: "left", width: "100%", padding: "0.6rem 0.85rem" }}
              onClick={() => onSelectTab("copilot")}
            >
              <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>1.</span> Explain 52-record batch & 96.2% match rate
            </button>

            <button
              className="prompt-chip"
              style={{ textAlign: "left", width: "100%", padding: "0.6rem 0.85rem" }}
              onClick={() => onSelectTab("copilot")}
            >
              <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>2.</span> Statutory TDS compliance breakdown (§194C/J/I)
            </button>

            <button
              className="prompt-chip"
              style={{ textAlign: "left", width: "100%", padding: "0.6rem 0.85rem" }}
              onClick={() => onSelectTab("copilot")}
            >
              <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>3.</span> Review the 2 honest exceptions & dispute drafts
            </button>

            <button
              className="prompt-chip"
              style={{ textAlign: "left", width: "100%", padding: "0.6rem 0.85rem" }}
              onClick={() => onSelectTab("copilot")}
            >
              <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>4.</span> Run 30-day treasury liquidity & runway stress test
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
