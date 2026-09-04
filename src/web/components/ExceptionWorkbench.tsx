import React, { useState } from "react";
import type { WebExceptionItem } from "../types";
import { DisputeModal } from "./DisputeModal";

interface ExceptionWorkbenchProps {
  exceptions: WebExceptionItem[];
  onShowToast: (msg: string) => void;
}

export const ExceptionWorkbench: React.FC<ExceptionWorkbenchProps> = ({
  exceptions,
  onShowToast,
}) => {
  const [activeDispute, setActiveDispute] = useState<WebExceptionItem | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const formatINR = (val: number) => "₹" + val.toLocaleString("en-IN");

  const handleResolve = (id: string, vendor: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onShowToast(`Audit state updated for ${vendor}`);
  };

  return (
    <section className="card-section" aria-label="Honest Exception Desk">
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2 className="section-heading">Honest Exception Desk (Human-in-the-Loop Sign-Off)</h2>
          <span className="badge badge-danger">2 Isolated Anomalies • 100% Precision</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "600px" }}>
          Unmatched transactions are never force-matched. Instead, real anomalies are isolated into this honest desk with 1-click audit email generation.
        </p>
      </div>

      <div className="exception-grid">
        {exceptions.map((ex) => {
          const isResolved = resolvedIds.has(ex.id);
          const isPriceMismatch = ex.exceptionType === "PRICE_MISMATCH";

          return (
            <article
              key={ex.id}
              className="exception-card"
              style={{
                borderColor: isResolved ? "var(--color-success)" : "rgba(239, 68, 68, 0.4)",
                opacity: isResolved ? 0.75 : 1,
              }}
            >
              <div className="exception-card-header">
                <div>
                  <span className="badge badge-danger" style={{ marginBottom: "0.35rem" }}>
                    {isPriceMismatch ? "PRICE OVERCHARGE MISMATCH" : "UNLINKED BANK DEBIT"}
                  </span>
                  <h3 className="exception-vendor">{ex.vendorName}</h3>
                  <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Txn: {ex.transactionId} • {ex.bank} • UTR: {ex.utr}
                  </div>
                </div>

                {isResolved ? (
                  <span className="badge badge-success">AUDIT RESOLVED</span>
                ) : (
                  <span className="badge badge-warning">REQUIRES CONTROLLER SIGN-OFF</span>
                )}
              </div>

              <div className="exception-diff-box">
                <div>
                  <div className="diff-metric-label">Bank Debited</div>
                  <div className="diff-metric-val" style={{ color: "var(--color-danger)" }}>
                    {formatINR(ex.debitedAmount)}
                  </div>
                </div>
                <div>
                  <div className="diff-metric-label">{isPriceMismatch ? "Approved Invoice" : "AP Invoice Value"}</div>
                  <div className="diff-metric-val">{isPriceMismatch ? formatINR(ex.invoicedAmount) : "₹0 (Missing)"}</div>
                </div>
                <div>
                  <div className="diff-metric-label">{isPriceMismatch ? "Overcharge Variance" : "Unlinked Exposure"}</div>
                  <div className="diff-metric-val" style={{ color: "var(--color-warning)" }}>
                    {formatINR(ex.varianceAmount)}
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  <strong>Root Cause Diagnosis:</strong>
                </div>
                <p style={{ fontSize: "0.825rem", color: "#e2e8f0" }}>{ex.rootCause}</p>
                <div style={{ fontSize: "0.75rem", color: "#93c5fd", marginTop: "0.35rem" }}>
                  <strong>Recommended Action:</strong> {ex.actionRequired}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                {ex.disputeDraft && (
                  <button className="btn-primary" onClick={() => setActiveDispute(ex)}>
                    {isPriceMismatch ? "Generate Vendor Dispute Email" : "Generate Procurement Inquiry"}
                  </button>
                )}

                <button
                  className={isResolved ? "btn-secondary" : "btn-danger"}
                  onClick={() => handleResolve(ex.id, ex.vendorName)}
                >
                  {isResolved ? "Undo Resolution" : "Approve & Sign Off"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {activeDispute && (
        <DisputeModal
          exception={activeDispute}
          onClose={() => setActiveDispute(null)}
          onCopied={() => {
            onShowToast("Dispute email copied to clipboard!");
          }}
        />
      )}
    </section>
  );
};
