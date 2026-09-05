/**
 * RazorTerminal Web Dashboard — Shared Data & Dynamic Ingestion Adapter
 */

import { AutonomousReconciliationEngine } from "../plugins/builtin/reconciliation/engine";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "../plugins/builtin/reconciliation/data";
import { generateRazorpayxPayoutPayload } from "../services/razorpayx-payout";
import type {
  InvoiceRecord,
  BankStatementRecord,
  RazorpaySettlementRecord,
} from "../plugins/builtin/reconciliation/types";
import type { WebReconciledMatch, WebExceptionItem, TreasuryState } from "./types";

const engine = new AutonomousReconciliationEngine();

export interface ReconciliationBatchOutput {
  matches: WebReconciledMatch[];
  exceptions: WebExceptionItem[];
  kpis: {
    totalTransactions: number;
    reconciledVolume: number;
    matchRate: number;
    autoMatchedCount: number;
    exceptionCount: number;
    precision: number;
    engineLatencyMs: number;
    throughputTps: number;
  };
}

export function getReconciledBatchData(
  customInvoices?: InvoiceRecord[],
  customBankTxns?: BankStatementRecord[],
  customSettlements?: RazorpaySettlementRecord[]
): ReconciliationBatchOutput {
  const invoices = customInvoices ?? SYNTHETIC_INVOICES;
  const allBankTxns = customBankTxns ?? [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS];
  const settlements = customSettlements ?? SYNTHETIC_RAZORPAY_SETTLEMENTS;

  const startTime = performance.now();
  const result = engine.reconcileBatch(invoices, allBankTxns, settlements);
  const elapsed = performance.now() - startTime;

  // Build full map of invoices for metadata lookup
  const invoiceMap = new Map(invoices.map((inv) => [inv.id, inv]));
  const bankTxnMap = new Map(allBankTxns.map((t) => [t.id, t]));

  const webMatches: WebReconciledMatch[] = result.matches.map((m) => {
    const inv = m.invoiceIds[0] ? invoiceMap.get(m.invoiceIds[0]) : undefined;
    const rawTxn = bankTxnMap.get(m.transactionId);
    const vendor = inv ? inv.vendorName : rawTxn?.narration.replace(/^(NEFT|RTGS|UPI|POS-DEBIT|CR)-/, "").split("-")[0] ?? "Autonomous Settlement";
    const invGrossAmount =
      m.invoiceIds.length > 1
        ? m.invoiceIds.reduce((sum, id) => sum + (invoiceMap.get(id)?.totalAmount ?? invoiceMap.get(id)?.netPayable ?? 0), 0)
        : (inv ? inv.totalAmount : m.matchedAmount);

    return {
      id: m.matchId || m.transactionId,
      transactionId: m.transactionId,
      bank: m.bank,
      transactionDate: m.transactionDate || "2026-08-20",
      debitAmount: m.transactionAmount,
      utr: m.utr,
      narration: rawTxn?.narration || m.explanation,
      invoiceIds: m.invoiceIds,
      vendorName: vendor,
      invoiceAmount: invGrossAmount,
      invoiceGrossAmount: invGrossAmount,
      category: m.category,
      confidence: Math.round(m.confidence * 100),
      status: "MATCHED",
      auditReason: m.explanation,
      tdsDeducted: m.auditTrace?.taxCalculated?.tdsWithheld,
      tdsSection: m.auditTrace?.taxCalculated?.section,
      fxRateApplied: m.auditTrace?.fxCalculated?.spotRate,
      gatewayFeeDeducted: m.auditTrace?.gatewayCalculated?.fee,
    };
  });

  const webExceptions: WebExceptionItem[] = result.exceptions.map((ex) => {
    const isPrice = ex.category === "PRICE_MISMATCH";
    const debited = ex.transactionAmount;
    const invoiced = isPrice ? (debited + (ex.discrepancyAmount ?? 40000)) : 0;
    const variance = isPrice ? (ex.discrepancyAmount ?? 40000) : debited;
    const vendor = isPrice ? "Overpriced Cloud Consultants" : "Unidentified Bank Debit";
    const invId = isPrice ? (ex.invoiceIds[0] || "INV-2026-036") : "N/A";

    return {
      id: ex.transactionId,
      transactionId: ex.transactionId,
      bank: ex.bank,
      utr: ex.utr,
      debitedAmount: debited,
      invoicedAmount: invoiced,
      varianceAmount: variance,
      vendorName: vendor,
      invoiceId: invId,
      exceptionType: isPrice ? "PRICE_MISMATCH" : "UNLINKED_INVOICE",
      rootCause: isPrice
        ? `Vendor billed ₹${debited.toLocaleString("en-IN")} on bank debit but invoice was approved for ₹${invoiced.toLocaleString("en-IN")} (Variance: ₹${variance.toLocaleString("en-IN")}).`
        : `Bank debit of ₹${debited.toLocaleString("en-IN")} has no corresponding AP invoice in ledger.`,
      actionRequired: isPrice ? "Issue Vendor Dispute & Request Credit Note" : "Request Missing Invoice from Procurement",
      status: "OPEN",
      disputeDraft: isPrice
        ? {
            recipient: "ap-billing@overpricedcloud.com",
            subject: `URGENT: Billing Variance Notice - Inv ${invId} (UTR: ${ex.utr})`,
            body: `Dear Accounts Payable Team,\n\nOur autonomous reconciliation system (RazorTerminal) detected a billing discrepancy on account of Invoice ${invId}.\n\n- Bank Debited Amount: ₹${debited.toLocaleString("en-IN")}\n- Approved Invoice Value: ₹${invoiced.toLocaleString("en-IN")}\n- Overcharge Variance: ₹${variance.toLocaleString("en-IN")}\n- Payment UTR: ${ex.utr}\n\nKindly issue a credit note or refund for the excess amount of ₹${variance.toLocaleString("en-IN")} within 3 business days.\n\nRegards,\nCorporate Treasury & Finance Controller\nRazorpayX Enterprise`,
          }
        : {
            recipient: "procurement-finance@company.com",
            subject: `ACTION REQUIRED: Missing AP Invoice for Bank Debit ₹${debited.toLocaleString("en-IN")} (UTR: ${ex.utr})`,
            body: `Dear Procurement & Internal Finance Team,\n\nOur autonomous reconciliation system (RazorTerminal) detected an unlinked corporate bank debit with no corresponding invoice in Accounts Payable.\n\n- Bank Debited Amount: ₹${debited.toLocaleString("en-IN")}\n- Bank Account: ${ex.bank} Corporate Current\n- Bank Narration: ACH-DEBIT-UNKNOWN-SUBSCRIPTION-SERV-MUMBAI\n- Payment UTR: ${ex.utr}\n\nPlease identify the departmental owner and furnish the approved vendor tax invoice to Accounts Payable immediately to clear this audit exception.\n\nRegards,\nCorporate Treasury & Finance Controller\nRazorpayX Enterprise`,
          },
      razorpayxPayoutPayload: generateRazorpayxPayoutPayload({
        vendorName: vendor,
        referenceId: isPrice ? invId : ex.transactionId,
        amountINR: isPrice ? variance : debited,
        purpose: isPrice ? "refund" : "vendor bill",
        narration: isPrice ? `Credit refund ${invId}` : `Adjustment ${ex.transactionId}`,
        notes: {
          exception_type: isPrice ? "PRICE_MISMATCH" : "UNLINKED_INVOICE",
          utr: ex.utr,
          bank: ex.bank,
        },
      }),
    };
  });

  return {
    matches: webMatches,
    exceptions: webExceptions,
    kpis: {
      totalTransactions: result.totalTransactionsProcessed,
      reconciledVolume: result.matchedVolumeINR,
      matchRate: result.matchRatePercent,
      autoMatchedCount: result.matchedCount,
      exceptionCount: result.exceptionCount,
      precision: result.precision * 100,
      engineLatencyMs: Math.max(0.8, Math.round(elapsed * 100) / 100),
      throughputTps: Math.round(result.totalTransactionsProcessed / ((elapsed || 1) / 1000)),
    },
  };
}

/**
 * Parses a standard bank statement CSV into BankStatementRecord[]
 */
export function parseBankStatementCsv(csvText: string, defaultBank: "ICICI" | "HDFC" = "ICICI"): BankStatementRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0]!.toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
  const dateIdx = headers.findIndex((h) => h.includes("date"));
  const descIdx = headers.findIndex((h) => h.includes("desc") || h.includes("narration") || h.includes("particulars"));
  const debitIdx = headers.findIndex((h) => h.includes("debit") || h.includes("withdrawal") || h.includes("amount"));
  const creditIdx = headers.findIndex((h) => h.includes("credit") || h.includes("deposit"));
  const utrIdx = headers.findIndex((h) => h.includes("utr") || h.includes("ref") || h.includes("chq"));

  const records: BankStatementRecord[] = [];
  let seq = 3000;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",").map((c) => c.trim().replace(/"/g, ""));
    if (cols.length < 2) continue;

    seq++;
    const date = cols[dateIdx >= 0 ? dateIdx : 0] || "2026-08-31";
    const narration = cols[descIdx >= 0 ? descIdx : 1] || `Transaction ${seq}`;
    const debitVal = debitIdx >= 0 ? parseFloat(cols[debitIdx] || "0") : 0;
    const creditVal = creditIdx >= 0 ? parseFloat(cols[creditIdx] || "0") : 0;
    const isDebit = creditVal <= 0;
    const amount = isDebit ? debitVal : creditVal;
    const utr = (utrIdx >= 0 ? cols[utrIdx] : "") || `UTR${seq}${Date.now().toString().slice(-4)}`;

    if (amount > 0) {
      records.push({
        id: `TXN-CUSTOM-${seq}`,
        bank: defaultBank,
        transactionDate: date,
        valueDate: date,
        type: isDebit ? "DEBIT" : "CREDIT",
        amount,
        utr,
        narration,
        balanceAfter: 5000000,
      });
    }
  }

  return records;
}

/**
 * Generates a high-volume Chaos Batch (80+ records) with synthetic bank noise
 */
export function generateChaosBatch(): {
  invoices: InvoiceRecord[];
  bankTxns: BankStatementRecord[];
  settlements: RazorpaySettlementRecord[];
} {
  const chaosInvoices: InvoiceRecord[] = [...SYNTHETIC_INVOICES];
  const chaosTxns: BankStatementRecord[] = [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS];

  // Inject 15 randomized high-frequency transactions with mixed TDS/noise
  const vendors = [
    { name: "DigitalOcean Cloud Mumbai", cat: "cloud", sec: "194C", rate: 0.02, amt: 65000 },
    { name: "Snowflake Data Warehousing", cat: "saas", sec: "194J", rate: 0.10, amt: 180000 },
    { name: "Trilegal Counsel India", cat: "legal", sec: "194J", rate: 0.10, amt: 220000 },
    { name: "Dunzo Logistics B2B", cat: "logistics", sec: "194C", rate: 0.02, amt: 34000 },
    { name: "Awfis Coworking Delhi", cat: "rent", sec: "194I", rate: 0.10, amt: 150000 },
  ];

  for (let i = 0; i < 20; i++) {
    const v = vendors[i % vendors.length]!;
    const invId = `INV-CHAOS-${100 + i}`;
    const baseAmt = v.amt + i * 2500;
    const tdsAmt = Math.round(baseAmt * v.rate);
    const netPaid = baseAmt - tdsAmt;
    const utr = `CHAOS${2608 + i}00${1000 + i}`;

    chaosInvoices.push({
      id: invId,
      vendorName: v.name,
      category: v.cat as any,
      invoiceDate: "2026-08-28",
      dueDate: "2026-09-05",
      currency: "INR",
      subtotal: baseAmt,
      taxRate: 0.18,
      taxAmount: Math.round(baseAmt * 0.18),
      totalAmount: baseAmt + Math.round(baseAmt * 0.18),
      tdsApplicable: true,
      tdsSection: v.sec as any,
      tdsRate: v.rate,
      expectedTdsAmount: tdsAmt,
      netPayable: netPaid,
    });

    chaosTxns.push({
      id: `TXN-CHAOS-${200 + i}`,
      bank: i % 2 === 0 ? "ICICI" : "HDFC",
      transactionDate: "2026-08-30",
      valueDate: "2026-08-30",
      type: "DEBIT",
      amount: netPaid,
      utr: utr,
      narration: `NEFT-${v.name.toUpperCase()}-${invId}-TDS-APPLIED`,
      balanceAfter: 4200000,
    });
  }

  return {
    invoices: chaosInvoices,
    bankTxns: chaosTxns,
    settlements: SYNTHETIC_RAZORPAY_SETTLEMENTS,
  };
}

export function getTreasuryState(): TreasuryState {
  const accounts = [
    {
      name: "HDFC Corporate Current",
      accountNumber: "50200088910291",
      balance: 38500000,
      currency: "INR",
      type: "CORPORATE_CURRENT" as const,
    },
    {
      name: "ICICI Operational Account",
      accountNumber: "000405018293",
      balance: 24500000,
      currency: "INR",
      type: "CORPORATE_CURRENT" as const,
    },
    {
      name: "SBI Treasury Reserve",
      accountNumber: "38920192831",
      balance: 12200000,
      currency: "INR",
      type: "TREASURY_RESERVE" as const,
    },
    {
      name: "RazorpayX Nodal Payouts",
      accountNumber: "RZPX-NODAL-99",
      balance: 9010000,
      currency: "INR",
      type: "NODAL_ESCROW" as const,
    },
  ];

  const totalLiquidCash = accounts.reduce((sum, a) => sum + a.balance, 0);
  const dailyBurnRate = 362000; // ~₹3.62L / day
  const projectedRunwayDays = Math.floor(totalLiquidCash / dailyBurnRate);

  const runwayCurve = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const date = new Date(2026, 7, 24 + day).toISOString().split("T")[0]!;
    const projectedBalance = Math.max(0, totalLiquidCash - dailyBurnRate * day);
    return { day, date, projectedBalance };
  });

  return {
    totalLiquidCash,
    dailyBurnRate,
    projectedRunwayDays,
    accounts,
    runwayCurve,
  };
}
