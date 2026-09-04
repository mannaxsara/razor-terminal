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
  const [copied, setCopied] = useState(false);
  const draft = exception.disputeDraft;

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

  const mailtoUrl = `mailto:${draft.recipient}?subject=${encodeURIComponent(
    draft.subject
  )}&body=${encodeURIComponent(draft.body)}`;

  const isPrice = exception.exceptionType === "PRICE_MISMATCH";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isPrice ? "Vendor Overcharge Dispute Notice" : "Procurement Missing Invoice Inquiry"}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              {isPrice
                ? `Automated Billing Discrepancy Notice for ${exception.vendorName}`
                : `Automated Missing Invoice Request for Bank Debit (UTR: ${exception.utr})`}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

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
      </div>
    </div>
  );
};
