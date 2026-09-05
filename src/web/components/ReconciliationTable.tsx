import React, { useState, useMemo, useRef } from "react";
import type { WebReconciledMatch } from "../types";

interface ReconciliationTableProps {
  matches: WebReconciledMatch[];
  onSelectRow?: (match: WebReconciledMatch) => void;
  onLoadStandardBatch?: () => void;
  onLoadChaosBatch?: () => void;
  onUploadCustomCsv?: (csvText: string, filename: string) => void;
  isIngesting?: boolean;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  matches,
  onSelectRow,
  onLoadStandardBatch,
  onLoadChaosBatch,
  onUploadCustomCsv,
  isIngesting = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedMatch, setSelectedMatch] = useState<WebReconciledMatch | null>(null);
  const [showUploadDrawer, setShowUploadDrawer] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatINR = (val: number) => "₹" + Math.round(val).toLocaleString("en-IN");

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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text && onUploadCustomCsv) {
          onUploadCustomCsv(text, file.name);
          setShowUploadDrawer(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text && onUploadCustomCsv) {
          onUploadCustomCsv(text, file.name);
          setShowUploadDrawer(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleBankCsv = () => {
    const csvRows = [
      "Date,Narration,Debit,Credit,UTR",
      "2026-08-14,NEFT-AMAZON WEB SERVICES-INV-2026-001-TDS-DED,145000,,ICIC260814001923",
      "2026-08-15,NEFT-GOOGLE CLOUD INDIA-INV-2026-002,92800,,ICIC260815004812",
      "2026-08-08,POS-DEBIT-SLACK TECHNOLOGIES-USD500-FX84.3,42150,,HDFC260808001124",
      "2026-08-09,POS-DEBIT-CLOUDFLARE INC-USD1000-FX84.4,84400,,HDFC260809002235",
      "2026-08-17,NEFT-ATLASSIAN SOFTWARE-INV-2026-005,53100,,ICIC260817008831",
      "2026-08-18,UPI-GITHUB-INV2026006,37760,,ICIC260818009942",
      "2026-08-19,RTGS-DATADOG INDIA TECH-INV-2026-007-TDS194J,118800,,ICIC260819001199",
      "2026-08-19,NEFT-NOTION LABS-INV-2026-008,21240,,HDFC260819003311",
      "2026-08-20,NEFT-FIGMA DESIGN-INV-2026-009,28320,,HDFC260820004422",
      "2026-08-21,NEFT-MONGODB CLOUD-INV-2026-010,76700,,ICIC260821005533",
      "2026-08-24,RTGS-SHARDUL AMARCHAND LEGAL-INV-2026-011,270000,,ICIC260824006644",
      "2026-08-25,RTGS-KPMG ADVISORY SERVICES-INV-2026-012,324000,,ICIC260825007755",
      "2026-08-21,NEFT-CODECRAFT AI-INV-2026-013-TDS-DEDUCTED,162000,,HDFC260821008866",
      "2026-08-22,NEFT-DEVOPS MAESTROS-INV-2026-014,97200,,HDFC260822009977",
      "2026-08-23,RTGS-CYBERSHIELD SECURITY-INV-2026-015,194400,,ICIC260823001234",
      "2026-08-04,RTGS-WEWORK INDIA-RENT-AUG26-TDS40K,432000,,ICIC260804005678",
      "2026-08-04,RTGS-INDIQUBE SPACES-RENT-AUG26,237600,,ICIC260804009012",
      "2026-08-24,NEFT-DELHIVERY EXPRESS-INV-2026-018,74240,,HDFC260824003456",
      "2026-08-24,NEFT-BLUEDART AVIATION-INV-2026-019,44080,,HDFC260824007890",
      "2026-08-16,NEFT-META ADS IRELAND-INV-2026-021,236000,,ICIC260816001357",
      "2026-08-18,NEFT-LINKEDIN ADS-INV-2026-022,141600,,ICIC260818002468",
      "2026-08-26,UPI-ADOBE SYSTEMS-INV-2026-023,19470,,HDFC260826003579",
      "2026-08-27,POS-DEBIT-TWILIO TELEPHONY-USD800-FX84.5,67600,,HDFC260827004680",
      "2026-08-27,POS-DEBIT-SENDGRID INC-USD350-FX84.4,29540,,HDFC260827005791",
      "2026-08-02,CR-RAZORPAY SOFTWARE-SETTLEMENT-001,,488200,RZPSETL260802001",
      "2026-08-06,CR-RAZORPAY SOFTWARE-SETTLEMENT-002,,800648,RZPSETL260806002",
      "2026-08-11,CR-RAZORPAY SOFTWARE-SETTLEMENT-003,,331976,RZPSETL260811003",
      "2026-08-16,CR-RAZORPAY SOFTWARE-SETTLEMENT-004,,1171680,RZPSETL260816004",
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_bank_statement_razor_terminal.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="card-section" aria-label="Reconciliation Batch Records">
      <div className="section-header-bar">
        <div className="section-title-group" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h2 className="section-heading">Multi-Source Reconciliation Batch</h2>
            <span className="badge badge-success">
              {matches.length} Records Loaded • {isIngesting ? "Reconciling..." : "Live Active Stream"}
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className="btn-secondary"
              onClick={() => setShowUploadDrawer(!showUploadDrawer)}
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              title="Upload your own bank statement or load synthetic chaos datasets"
            >
              <span>📂 Ingestion Sandbox</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>{showUploadDrawer ? "▲" : "▼"}</span>
            </button>

            <a
              href="/api/erp-export?format=csv"
              download="razor_terminal_erp_journals_zoho.csv"
              className="btn-primary"
              style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
              title="Download Indian GAAP Double-Entry Journal Entries for Zoho Books and Tally Prime"
            >
              📥 Export ERP (Zoho CSV)
            </a>
            <a
              href="/api/erp-export?format=json"
              download="razor_terminal_erp_journals.json"
              className="btn-secondary"
              style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
              title="Download balanced double-entry vouchers JSON"
            >
              Export JSON
            </a>
          </div>
        </div>

        {/* Ingestion & Custom Data Sandbox Drawer */}
        {showUploadDrawer && (
          <div
            style={{
              width: "100%",
              marginTop: "0.75rem",
              marginBottom: "0.5rem",
              padding: "1rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>
                  Autonomous Ingestion Sandbox & Dataset Controls
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Upload arbitrary bank statement CSVs or switch to high-volume chaos batches to test dynamic reconciliation.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {onLoadStandardBatch && (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      onLoadStandardBatch();
                      setShowUploadDrawer(false);
                    }}
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}
                  >
                    ⚡ Standard 52-Record Batch
                  </button>
                )}

                {onLoadChaosBatch && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      onLoadChaosBatch();
                      setShowUploadDrawer(false);
                    }}
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem", backgroundColor: "#f59e0b" }}
                  >
                    🔥 High-Volume Chaos Batch (70+ tx)
                  </button>
                )}

                <button
                  className="btn-secondary"
                  onClick={downloadSampleBankCsv}
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}
                >
                  📥 Download Sample CSV
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? "var(--color-brand)" : "var(--border-subtle)"}`,
                borderRadius: "6px",
                padding: "1.25rem",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: dragActive ? "rgba(51, 149, 255, 0.08)" : "var(--bg-app)",
                transition: "all 0.2s ease",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📄</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                Drop Custom Bank Statement CSV here, or click to browse
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Supports ICICI, HDFC, or generic standard bank statement exports (`Date, Narration, Debit, Credit, UTR`)
              </div>
            </div>
          </div>
        )}

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
            TDS Deducted ({matches.filter((m) => m.category === "TDS_DEDUCTION" || m.category.startsWith("TDS")).length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "FX" ? "active" : ""}`}
            onClick={() => setCategoryFilter("FX")}
          >
            USD FX ({matches.filter((m) => m.category === "FX_CONVERSION" || m.category.startsWith("FX")).length})
          </button>
          <button
            className={`pill-filter ${categoryFilter === "GATEWAY" ? "active" : ""}`}
            onClick={() => setCategoryFilter("GATEWAY")}
          >
            Razorpay MDR ({matches.filter((m) => m.category === "GATEWAY_FEE_SPLIT" || m.category.startsWith("GATEWAY")).length})
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
                  <td>
                    <span className="badge badge-success">
                      ✓ Reconciled
                    </span>
                  </td>
                  <td>
                    <div className="font-mono" style={{ fontWeight: 600 }}>{m.transactionId}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {m.bank} • {m.transactionDate}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.vendorName}</div>
                    <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {m.invoiceIds.length > 0 ? m.invoiceIds.join(", ") : "UTR: " + m.utr.slice(0, 14)}
                    </div>
                  </td>
                  <td className="font-mono" style={{ fontWeight: 700 }}>
                    {formatINR(m.debitAmount)}
                  </td>
                  <td className="font-mono" style={{ color: "var(--text-secondary)" }}>
                    <div>{formatINR(m.invoiceAmount)}</div>
                    {m.tdsDeducted && m.tdsDeducted > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "#f59e0b", marginTop: "2px" }}>
                        - {formatINR(m.tdsDeducted)} TDS
                      </div>
                    )}
                  </td>
                  <td>
                    {getCategoryBadge(m.category, m.tdsSection)}
                    {m.tdsDeducted && m.tdsDeducted > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "#fbbf24", marginTop: "2px" }}>
                        Net: {formatINR(m.invoiceAmount - m.tdsDeducted)}
                      </div>
                    )}
                    {m.fxRateApplied && (
                      <div style={{ fontSize: "0.7rem", color: "#38bdf8", marginTop: "2px" }}>
                        @ ₹{m.fxRateApplied.toFixed(2)}/USD
                      </div>
                    )}
                    {m.gatewayFeeDeducted && m.gatewayFeeDeducted > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "#93c5fd", marginTop: "2px" }}>
                        - {formatINR(m.gatewayFeeDeducted)} Fee+GST
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="font-mono" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-success)" }}>
                        {m.confidence}%
                      </span>
                    </div>
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
