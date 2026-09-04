import React, { useState, useMemo } from "react";
import type { WebReconciledMatch } from "../types";

interface ReconciliationTableProps {
  matches: WebReconciledMatch[];
  onSelectRow?: (match: WebReconciledMatch) => void;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  matches,
  onSelectRow,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedMatch, setSelectedMatch] = useState<WebReconciledMatch | null>(null);

  const formatINR = (val: number) => "₹" + val.toLocaleString("en-IN");

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        m.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.utr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.invoiceIds.some((id) => id.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesCategory = true;
      if (categoryFilter === "DIRECT") matchesCategory = m.category === "DIRECT_100_MATCH";
      if (categoryFilter === "TDS") matchesCategory = m.category === "TDS_DEDUCTION" || m.category.startsWith("TDS");
      if (categoryFilter === "FX") matchesCategory = m.category === "FX_CONVERSION" || m.category.startsWith("FX");
      if (categoryFilter === "GATEWAY") matchesCategory = m.category === "GATEWAY_FEE_SPLIT" || m.category.startsWith("GATEWAY");
      if (categoryFilter === "SPLIT_BULK") matchesCategory = m.category === "SPLIT_PAYMENT" || m.category === "BULK_PAYMENT";

      return matchesSearch && matchesCategory;
    });
  }, [matches, searchTerm, categoryFilter]);

  const getCategoryBadge = (cat: string, tdsSection?: string) => {
    if (cat === "DIRECT_100_MATCH") {
      return <span className="badge badge-success">Exact Match</span>;
    }
    if (cat === "TDS_DEDUCTION" || cat.startsWith("TDS")) {
      return <span className="badge badge-warning">TDS Deducted{tdsSection ? ` §${tdsSection}` : ""}</span>;
    }
    if (cat === "FX_CONVERSION" || cat.startsWith("FX")) {
      return <span className="badge badge-info">USD FX Spot</span>;
    }
    if (cat === "GATEWAY_FEE_SPLIT" || cat.startsWith("GATEWAY")) {
      return <span className="badge badge-info" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" }}>Razorpay Net</span>;
    }
    if (cat === "SPLIT_PAYMENT") {
      return <span className="badge badge-secondary" style={{ backgroundColor: "rgba(148, 163, 184, 0.15)", color: "#cbd5e1" }}>Split Tranche</span>;
    }
    if (cat === "BULK_PAYMENT") {
      return <span className="badge badge-secondary" style={{ backgroundColor: "rgba(148, 163, 184, 0.15)", color: "#cbd5e1" }}>Bulk Consolidated</span>;
    }
    return <span className="badge badge-info">{cat}</span>;
  };

  const handleRowClick = (m: WebReconciledMatch) => {
    setSelectedMatch(m);
    if (onSelectRow) onSelectRow(m);
  };

  return (
    <section className="card-section" aria-label="Reconciliation Batch Records">
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2 className="section-heading">Multi-Source Reconciliation Batch</h2>
          <span className="badge badge-success">52 Records Ingested • 50 Auto-Matched (96.2%)</span>
        </div>

        <div className="filter-bar">
          <input
            type="search"
            placeholder="Search vendor, invoice, UTR..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search records"
          />

          <button
            className={`pill-filter ${categoryFilter === "ALL" ? "active" : ""}`}
            onClick={() => setCategoryFilter("ALL")}
          >
            All ({matches.length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "DIRECT" ? "active" : ""}`}
            onClick={() => setCategoryFilter("DIRECT")}
          >
            Exact Match ({matches.filter((m) => m.category === "DIRECT_100_MATCH").length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "TDS" ? "active" : ""}`}
            onClick={() => setCategoryFilter("TDS")}
          >
            TDS Deducted ({matches.filter((m) => m.category === "TDS_DEDUCTION").length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "FX" ? "active" : ""}`}
            onClick={() => setCategoryFilter("FX")}
          >
            USD FX ({matches.filter((m) => m.category === "FX_CONVERSION").length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "GATEWAY" ? "active" : ""}`}
            onClick={() => setCategoryFilter("GATEWAY")}
          >
            Razorpay MDR ({matches.filter((m) => m.category === "GATEWAY_FEE_SPLIT").length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "SPLIT_BULK" ? "active" : ""}`}
            onClick={() => setCategoryFilter("SPLIT_BULK")}
          >
            Split/Bulk ({matches.filter((m) => m.category === "SPLIT_PAYMENT" || m.category === "BULK_PAYMENT").length})
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Transaction ID / Bank</th>
              <th scope="col">Vendor & Invoice</th>
              <th scope="col">Bank Debit</th>
              <th scope="col">Invoice Value</th>
              <th scope="col">Match Rule</th>
              <th scope="col">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  No matching records found for "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredMatches.map((m) => (
                <tr key={m.id} onClick={() => handleRowClick(m)}>
                  <td>{getCategoryBadge(m.category, m.tdsSection)}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.transactionId}</div>
                    <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {m.bank} • UTR: {m.utr.substring(0, 10)}...
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.vendorName}</div>
                    <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {m.invoiceIds.join(", ") || "Auto-detected"}
                    </div>
                  </td>
                  <td className="font-mono" style={{ fontWeight: 700 }}>
                    {formatINR(m.debitAmount)}
                  </td>
                  <td className="font-mono" style={{ color: "var(--text-secondary)" }}>
                    {formatINR(m.invoiceAmount)}
                  </td>
                  <td style={{ fontSize: "0.775rem", color: "var(--text-muted)", maxWidth: "240px" }}>
                    {m.auditReason}
                  </td>
                  <td>
                    <span
                      style={{
                        color: m.confidence >= 95 ? "var(--color-success)" : "var(--color-warning)",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {m.confidence}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">3-Way Match Audit Breakdown</h3>
              <button className="modal-close-btn" onClick={() => setSelectedMatch(null)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Bank Debit Details</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.25rem" }}>
                  {formatINR(selectedMatch.debitAmount)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {selectedMatch.bank} • {selectedMatch.transactionId}
                </div>
                <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  UTR: {selectedMatch.utr}
                </div>
              </div>

              <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>AP Ledger Invoice</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.25rem" }}>
                  {formatINR(selectedMatch.invoiceAmount)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {selectedMatch.vendorName}
                </div>
                <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Inv ID: {selectedMatch.invoiceIds.join(", ")}
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Autonomous Match Explanation & Tax Proof
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>{selectedMatch.auditReason}</p>
              {selectedMatch.tdsDeducted && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#fbbf24" }}>
                  Statutory TDS Deducted: {formatINR(selectedMatch.tdsDeducted)} (§{selectedMatch.tdsSection})
                </div>
              )}
              {selectedMatch.fxRateApplied && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#38bdf8" }}>
                  Effective FX Conversion Rate: ₹{selectedMatch.fxRateApplied.toFixed(2)} / USD
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setSelectedMatch(null)}>
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
