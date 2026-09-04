/**
 * RazorTerminal — Core Domain Types for Reconciliation & Treasury
 */

export interface InvoiceRecord {
  id: string;
  vendorName: string;
  vendorGst?: string;
  vendorPan?: string;
  category: "cloud" | "saas" | "contractor" | "legal" | "rent" | "logistics" | "hardware" | "marketing" | "gateway";
  invoiceDate: string;
  dueDate: string;
  currency: "INR" | "USD";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  tdsApplicable: boolean;
  tdsSection?: "194C" | "194J" | "194I";
  tdsRate?: number;
  expectedTdsAmount?: number;
  netPayable: number;
}

export interface BankStatementRecord {
  id: string;
  bank: "ICICI" | "HDFC" | "AXIS";
  transactionDate: string;
  valueDate: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  utr: string;
  narration: string;
  balanceAfter: number;
}

export interface RazorpaySettlementRecord {
  id: string;
  settlementDate: string;
  grossAmount: number;
  fee: number;
  tax: number;
  netSettlementAmount: number;
  utr: string;
  status: "processed" | "failed";
}

export type MatchCategory = 
  | "DIRECT_100_MATCH"
  | "TDS_DEDUCTION"
  | "FX_CONVERSION"
  | "GATEWAY_FEE_SPLIT"
  | "SPLIT_PAYMENT"
  | "BULK_PAYMENT"
  | "DUPLICATE_INVOICE"
  | "PRICE_MISMATCH"
  | "UNIDENTIFIED_DEBIT"
  | "CANCELLED_ORDER";

export interface ReconciledMatch {
  matchId: string;
  transactionId: string;
  transactionAmount: number;
  transactionDate: string;
  bank: string;
  utr: string;
  invoiceIds: string[];
  settlementId?: string;
  matchedAmount: number;
  discrepancyAmount: number;
  category: MatchCategory;
  confidence: number;
  explanation: string;
  isException: boolean;
  requiresHumanApproval: boolean;
  suggestedAction: "AUTO_RECONCILE" | "AUTO_ADJUST_TDS" | "AUTO_ADJUST_FX" | "AUTO_SPLIT" | "FLAG_EXCEPTION_DUPLICATE" | "FLAG_EXCEPTION_PRICE" | "FLAG_EXCEPTION_UNKNOWN";
  auditTrace: {
    ruleMatched: string;
    stagesAttempted: string[];
    taxCalculated?: { section: string; tdsWithheld: number };
    fxCalculated?: { spotRate: number; originalCurrency: string; originalAmount: number };
    gatewayCalculated?: { fee: number; tax: number; gross: number };
  };
}

export interface ReconciliationResult {
  totalTransactionsProcessed: number;
  totalVolumeINR: number;
  matchedCount: number;
  matchedVolumeINR: number;
  exceptionCount: number;
  exceptionVolumeINR: number;
  matchRatePercent: number;
  precision: number;
  recall: number;
  matches: ReconciledMatch[];
  exceptions: ReconciledMatch[];
}
