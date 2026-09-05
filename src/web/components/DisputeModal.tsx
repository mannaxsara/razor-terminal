import React, { useState } from "react";
import type { WebExceptionItem } from "../types";

interface DisputeModalProps {
  exception: WebExceptionItem;
  onClose: () => void;
  onCopied: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  exception,
  onClose,
  onCopied,
}) => {
  const [activeTab, setActiveTab] = useState<"email" | "payout">("email");
  const [copied, setCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const draft = exception.disputeDraft;
  const payoutPayload = exception.razorpayxPayoutPayload;

  if (!draft) return null;

  const handleCopy = () => {
    const textToCopy = `To: ${draft.recipient}\nSubject: ${draft.subject}\n\n${draft.body}`;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      });
    } else if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    onCopied();
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyPayload = () => {
    if (!payoutPayload) return;
    const jsonStr = JSON.stringify(payoutPayload, null, 2);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonStr);
    }
    setPayloadCopied(true);
    onCopied();
    setTimeout(() => setPayloadCopied(false), 3000);
  };

  const mailtoUrl = `mailto:${draft.recipient}?subject=${encodeURIComponent(
    draft.subject
  )}&body=${encodeURIComponent(draft.body)}`;

  const isPrice = exception.exceptionType === "PRICE_MISMATCH";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isPrice ? "Vendor Overcharge Action Center" : "Procurement Missing Invoice Action Center"}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              {isPrice
                ? `Dispute Draft & RazorpayX Payout Correction for ${exception.vendorName}`
                : `Missing Invoice Request & Settlement Payload for UTR: ${exception.utr}`}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
          <button
            className={`pill-filter ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            ✉️ Dispute Notice Draft
          </button>
          <button
            className={`pill-filter ${activeTab === "payout" ? "active" : ""}`}
            onClick={() => setActiveTab("payout")}
          >
            ⚡ RazorpayX Payout API Payload (POST /v1/payouts)
          </button>
        </div>

        {activeTab === "email" ? (
          <>
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                <strong>Recipient:</strong> <span className="font-mono">{draft.recipient}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <strong>Subject:</strong> {draft.subject}
              </div>
            </div>

            <div className="email-preview-box">{draft.body}</div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textDecoration: "none" }}
              >
                Open in Email Client
              </a>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy Dispute Draft"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                <strong>Endpoint:</strong> <span className="font-mono" style={{ color: "#38bdf8" }}>POST https://api.razorpay.com/v1/payouts</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Production-ready idempotent JSON payload for 1-click execution or accounting adjustments.
              </div>
            </div>

            <pre
              className="font-mono"
              style={{
                backgroundColor: "#0d1117",
                padding: "1rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                maxHeight: "260px",
                overflowY: "auto",
                border: "1px solid var(--border-subtle)",
                color: "#7dd3fc",
                lineHeight: "1.4",
              }}
            >
              {JSON.stringify(payoutPayload, null, 2)}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn-primary" onClick={handleCopyPayload}>
                {payloadCopied ? "Copied JSON!" : "Copy API Payload"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
