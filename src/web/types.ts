/**
 * RazorTerminal Web Dashboard — Type Definitions
 */

import type { MatchCategory as EngineMatchCategory } from "../plugins/builtin/reconciliation/types";

export type MatchCategory = EngineMatchCategory;

export interface WebReconciledMatch {
  id: string;
  transactionId: string;
  bank: string;
  transactionDate: string;
  debitAmount: number;
  utr: string;
  narration: string;
  invoiceIds: string[];
  vendorName: string;
  invoiceAmount: number;
  invoiceGrossAmount?: number;
  category: MatchCategory;
  confidence: number;
  status: "MATCHED" | "EXCEPTION";
  auditReason: string;
  tdsDeducted?: number;
  tdsSection?: string;
  fxRateApplied?: number;
  gatewayFeeDeducted?: number;
}

export interface WebExceptionItem {
  id: string;
  transactionId: string;
  bank: string;
  utr: string;
  debitedAmount: number;
  invoicedAmount: number;
  varianceAmount: number;
  vendorName: string;
  invoiceId: string;
  exceptionType: "PRICE_MISMATCH" | "UNLINKED_INVOICE" | "DUPLICATE_DEBIT";
  rootCause: string;
  actionRequired: string;
  status: "OPEN" | "DISPUTED" | "RESOLVED";
  disputeDraft?: {
    recipient: string;
    subject: string;
    body: string;
  };
  razorpayxPayoutPayload?: Record<string, any>;
}

export interface TreasuryAccount {
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: "CORPORATE_CURRENT" | "TREASURY_RESERVE" | "NODAL_ESCROW";
}

export interface TreasuryState {
  totalLiquidCash: number;
  dailyBurnRate: number;
  projectedRunwayDays: number;
  accounts: TreasuryAccount[];
  runwayCurve: Array<{ day: number; date: string; projectedBalance: number }>;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  timestamp: string;
  text: string;
  structuredData?: {
    title?: string;
    items?: Array<{ label: string; value: string | number; badge?: string }>;
    actionButton?: { label: string; actionId: string };
  };
}
