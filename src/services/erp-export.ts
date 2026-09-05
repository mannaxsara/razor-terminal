/**
 * RazorTerminal — Double-Entry ERP Journal Entry Generator (Indian GAAP)
 * Generates audit-compliant balanced vouchers for Zoho Books, Tally Prime, and SAP.
 */

import { AutonomousReconciliationEngine } from "../plugins/builtin/reconciliation/engine";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "../plugins/builtin/reconciliation/data";
import type { ReconciledMatch } from "../plugins/builtin/reconciliation/types";

export interface JournalLineItem {
  accountName: string;
  accountType: "EXPENSE" | "BANK" | "LIABILITY" | "ASSET" | "REVENUE";
  accountCode: string;
  debitINR: number;
  creditINR: number;
  narration: string;
}

export interface ErpJournalVoucher {
  voucherNumber: string;
  voucherDate: string;
  voucherType: "PAYMENT" | "RECEIPT" | "JOURNAL";
  referenceId: string;
  utr: string;
  category: string;
  totalDebitINR: number;
  totalCreditINR: number;
  isBalanced: boolean;
  lineItems: JournalLineItem[];
}

export interface ErpExportSummary {
  vouchers: ErpJournalVoucher[];
  totalVouchers: number;
  totalVolumeINR: number;
  totalTdsWithheldINR: number;
  totalGatewayFeesINR: number;
  allBalanced: boolean;
}

export class ErpJournalGenerator {
  private reconEngine: AutonomousReconciliationEngine;
  private matches: ReconciledMatch[];

  constructor() {
    this.reconEngine = new AutonomousReconciliationEngine();
    const allTx = [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS];
    const results = this.reconEngine.reconcileBatch(
      SYNTHETIC_INVOICES,
      allTx,
      SYNTHETIC_RAZORPAY_SETTLEMENTS
    );
    this.matches = results.matches;
  }

  public generateVouchers(): ErpExportSummary {
    let voucherSeq = 1000;
    let totalTds = 0;
    let totalMdr = 0;
    let totalVolume = 0;

    const vouchers: ErpJournalVoucher[] = this.matches.map((match) => {
      voucherSeq++;
      const vNum = `JV-2026-${voucherSeq}`;
      const lineItems: JournalLineItem[] = [];

      totalVolume += match.transactionAmount;

      // 1. GATEWAY SETTLEMENT (Gross - 2% MDR - 18% GST = Net Deposit)
      if (match.category === "GATEWAY_FEE_SPLIT") {
        const setl = SYNTHETIC_RAZORPAY_SETTLEMENTS.find((s) => s.id === match.settlementId) || SYNTHETIC_RAZORPAY_SETTLEMENTS[0];
        const fee = setl.fee;
        const tax = setl.tax;
        const net = setl.netSettlementAmount;
        const gross = setl.grossAmount;

        totalMdr += fee + tax;

        // Debit: Bank Account
        lineItems.push({
          accountName: `${match.bank} Corporate Current A/C`,
          accountType: "BANK",
          accountCode: "1001-BANK",
          debitINR: net,
          creditINR: 0,
          narration: `Net settlement deposit via RazorpayX (UTR: ${match.utr})`,
        });

        // Debit: Gateway Processing Fee Expense
        lineItems.push({
          accountName: "Payment Gateway Processing Fees (2% MDR)",
          accountType: "EXPENSE",
          accountCode: "5020-PG-FEE",
          debitINR: fee,
          creditINR: 0,
          narration: `Razorpay MDR 2.00% on gross ₹${gross.toLocaleString("en-IN")}`,
        });

        // Debit: Input GST on Financial Services
        lineItems.push({
          accountName: "Input GST Receivable (18% on Gateway Services)",
          accountType: "ASSET",
          accountCode: "1050-GST-INP",
          debitINR: tax,
          creditINR: 0,
          narration: `18% CGST/SGST on Razorpay Gateway Fee ₹${fee.toLocaleString("en-IN")}`,
        });

        // Credit: Customer Accounts Receivable
        lineItems.push({
          accountName: "Customer Accounts Receivable Ledger",
          accountType: "REVENUE",
          accountCode: "4001-SALES",
          debitINR: 0,
          creditINR: gross,
          narration: `Gross customer settlements collected for ${match.invoiceIds.join(", ")}`,
        });

        const totalDebit = net + fee + tax;
        const totalCredit = gross;

        return {
          voucherNumber: vNum,
          voucherDate: match.transactionDate,
          voucherType: "RECEIPT",
          referenceId: match.transactionId,
          utr: match.utr,
          category: match.category,
          totalDebitINR: totalDebit,
          totalCreditINR: totalCredit,
          isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
          lineItems,
        };
      }

      // 2. TDS DEDUCTION (Section 194C / 194J / 194I)
      if (match.category === "TDS_DEDUCTION") {
        const inv = SYNTHETIC_INVOICES.find((i) => match.invoiceIds.includes(i.id)) || SYNTHETIC_INVOICES[0];
        const tdsAmount = match.discrepancyAmount ?? 0;
        const netPaid = match.transactionAmount;
        const grossExpense = netPaid + tdsAmount;
        const section = inv.tdsSection ?? "194J";

        totalTds += tdsAmount;

        // Debit: Vendor Expense Account (Gross)
        lineItems.push({
          accountName: `Vendor Expense — ${inv.vendorName}`,
          accountType: "EXPENSE",
          accountCode: `5001-${inv.category.toUpperCase()}`,
          debitINR: grossExpense,
          creditINR: 0,
          narration: `Invoice ${inv.id} gross bill amount`,
        });

        // Credit: Corporate Bank Account (Net paid)
        lineItems.push({
          accountName: `${match.bank} Corporate Current A/C`,
          accountType: "BANK",
          accountCode: "1001-BANK",
          debitINR: 0,
          creditINR: netPaid,
          narration: `Net payment dispatched via NEFT/RTGS (UTR: ${match.utr})`,
        });

        // Credit: Statutory TDS Liability Account
        lineItems.push({
          accountName: `TDS Payable to Govt of India (§${section})`,
          accountType: "LIABILITY",
          accountCode: `2050-TDS-${section}`,
          debitINR: 0,
          creditINR: tdsAmount,
          narration: `Statutory TDS withheld under Section ${section} for deposit to Govt Treasury`,
        });

        const totalDebit = grossExpense;
        const totalCredit = netPaid + tdsAmount;

        return {
          voucherNumber: vNum,
          voucherDate: match.transactionDate,
          voucherType: "PAYMENT",
          referenceId: match.transactionId,
          utr: match.utr,
          category: match.category,
          totalDebitINR: totalDebit,
          totalCreditINR: totalCredit,
          isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
          lineItems,
        };
      }

      // 3. DIRECT MATCH OR FX CONVERSION (100% Exact Matching)
      const inv = SYNTHETIC_INVOICES.find((i) => match.invoiceIds.includes(i.id)) || SYNTHETIC_INVOICES[0];
      const amount = match.transactionAmount;

      lineItems.push({
        accountName: `Vendor Expense — ${inv.vendorName}`,
        accountType: "EXPENSE",
        accountCode: `5001-${inv.category.toUpperCase()}`,
        debitINR: amount,
        creditINR: 0,
        narration: `Settlement for invoice ${inv.id} (Category: ${match.category})`,
      });

      lineItems.push({
        accountName: `${match.bank} Corporate Current A/C`,
        accountType: "BANK",
        accountCode: "1001-BANK",
        debitINR: 0,
        creditINR: amount,
        narration: `Corporate debit cleared via banking channel (UTR: ${match.utr})`,
      });

      return {
        voucherNumber: vNum,
        voucherDate: match.transactionDate,
        voucherType: "PAYMENT",
        referenceId: match.transactionId,
        utr: match.utr,
        category: match.category,
        totalDebitINR: amount,
        totalCreditINR: amount,
        isBalanced: true,
        lineItems,
      };
    });

    const allBalanced = vouchers.every((v) => v.isBalanced);

    return {
      vouchers,
      totalVouchers: vouchers.length,
      totalVolumeINR: totalVolume,
      totalTdsWithheldINR: totalTds,
      totalGatewayFeesINR: totalMdr,
      allBalanced,
    };
  }

  public toZohoBooksCsv(): string {
    const summary = this.generateVouchers();
    const headers = [
      "Voucher Number",
      "Date",
      "Voucher Type",
      "Account Name",
      "Account Code",
      "Debit (INR)",
      "Credit (INR)",
      "Narration",
      "Banking UTR",
      "Reference ID",
    ];

    const rows: string[] = [headers.join(",")];

    summary.vouchers.forEach((v) => {
      v.lineItems.forEach((line) => {
        const row = [
          `"${v.voucherNumber}"`,
          `"${v.voucherDate}"`,
          `"${v.voucherType}"`,
          `"${line.accountName}"`,
          `"${line.accountCode}"`,
          line.debitINR > 0 ? line.debitINR.toFixed(2) : "",
          line.creditINR > 0 ? line.creditINR.toFixed(2) : "",
          `"${line.narration}"`,
          `"${v.utr}"`,
          `"${v.referenceId}"`,
        ];
        rows.push(row.join(","));
      });
    });

    return rows.join("\n");
  }
}
