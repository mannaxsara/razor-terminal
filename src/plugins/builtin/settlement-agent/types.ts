/**
 * RazorTerminal — Settlement Q&A & Dispute Resolution Agent Types
 */

import type { InvoiceRecord, BankStatementRecord, RazorpaySettlementRecord } from "../reconciliation/types";

export type QaIntent = 
  | "SETTLEMENT_EXPLANATION"
  | "TDS_BREAKDOWN"
  | "RUNWAY_SIMULATION"
  | "DISPUTE_DRAFT"
  | "GENERAL_FINANCE";

export interface DisputeLetterDraft {
  vendorName: string;
  invoiceId: string;
  invoiceDate: string;
  billedNet: number;
  bankDebited: number;
  discrepancyAmount: number;
  reason: string;
  formattedLetter: string;
}

export interface SettlementQaAnswer {
  id: string;
  query: string;
  intent: QaIntent;
  summaryText: string;
  breakdownLines: string[];
  disputeDraft?: DisputeLetterDraft;
  calculatedMetrics?: {
    grossAmount?: number;
    feeAmount?: number;
    taxAmount?: number;
    netAmount?: number;
    totalTdsWithheld?: number;
    projectedRunwayDays?: number;
  };
  timestamp: string;
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  query: string;
  description: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "p1",
    label: "Settlement Audit",
    query: "Why was Razorpay settlement #setl_003 ₹8,024 less than the gross invoice amount?",
    description: "Detailed breakdown of 2% MDR fee and 18% GST.",
  },
  {
    id: "p2",
    label: "TDS Tax Summary",
    query: "Show total Section 194J and Section 194C TDS withheld for this month.",
    description: "Statutory withholding tax totals and compliance report.",
  },
  {
    id: "p3",
    label: "Runway Stress Test",
    query: "What happens to our 30-day treasury runway if AWS debits ₹2,00,000 next Monday?",
    description: "Dynamic working capital runway impact simulation.",
  },
  {
    id: "p4",
    label: "Draft Vendor Dispute",
    query: "Draft a formal dispute notice for overbilled invoice INV-2026-036 (discrepancy ₹40,000).",
    description: "Generates an audit-ready vendor dispute letter.",
  },
];
