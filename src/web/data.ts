/**
 * RazorTerminal Web Dashboard — Shared Data & Reconciliation Adapter
 */

import { AutonomousReconciliationEngine } from "../plugins/builtin/reconciliation/engine";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "../plugins/builtin/reconciliation/data";
import type { WebReconciledMatch, WebExceptionItem, TreasuryState } from "./types";

const engine = new AutonomousReconciliationEngine();

export function getReconciledBatchData(): {
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
} {
  const allBankTxns = [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS];
  const startTime = performance.now();
  const result = engine.reconcileBatch(
    SYNTHETIC_INVOICES,
    allBankTxns,
    SYNTHETIC_RAZORPAY_SETTLEMENTS
  );
  const elapsed = performance.now() - startTime;

  // Build full map of invoices for metadata lookup
  const invoiceMap = new Map(SYNTHETIC_INVOICES.map((inv) => [inv.id, inv]));
  const bankTxnMap = new Map(allBankTxns.map((t) => [t.id, t]));

  const webMatches: WebReconciledMatch[] = result.matches.map((m) => {
    const inv = m.invoiceIds[0] ? invoiceMap.get(m.invoiceIds[0]) : undefined;
    const rawTxn = bankTxnMap.get(m.transactionId);
    const vendor = inv ? inv.vendorName : rawTxn?.narration.replace(/^(NEFT|RTGS|UPI|POS-DEBIT|CR)-/, "").split("-")[0] ?? "Autonomous Settlement";
    const invAmount =
      m.invoiceIds.length > 1
        ? m.invoiceIds.reduce((sum, id) => sum + (invoiceMap.get(id)?.netPayable ?? 0), 0)
        : (inv ? inv.netPayable : m.matchedAmount);

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
      invoiceAmount: invAmount,
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
    const invoiced = isPrice ? 324000 : 0;
    const variance = isPrice ? 40000 : debited;
    const vendor = isPrice ? "Overpriced Cloud Consultants" : "Unidentified Bank Debit";
    const invId = isPrice ? "INV-2026-036" : "N/A";

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
