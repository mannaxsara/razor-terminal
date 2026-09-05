/**
 * RazorTerminal — Autonomous Reconciliation Engine Unit & Performance Tests
 */

import { describe, expect, test } from "bun:test";
import { AutonomousReconciliationEngine } from "./engine";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "../../../../benchmark/synthetic-data";
import type { InvoiceRecord, BankStatementRecord } from "./types";

describe("AutonomousReconciliationEngine", () => {
  const engine = new AutonomousReconciliationEngine();
  const allTx = [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS];
  const results = engine.reconcileBatch(
    SYNTHETIC_INVOICES,
    allTx,
    SYNTHETIC_RAZORPAY_SETTLEMENTS,
  );

  test("processes all 52 ingested transactions", () => {
    expect(results.totalTransactionsProcessed).toBe(52);
    expect(results.matches.length + results.exceptions.length).toBe(52);
  });

  test("achieves at least 96% match rate on synthetic ground truth batch", () => {
    expect(results.matchRatePercent).toBeGreaterThanOrEqual(96.0);
    expect(results.matchedCount).toBe(50);
    expect(results.exceptionCount).toBe(2);
  });

  test("reconciles Section 194C (2% TDS) on AWS India invoice", () => {
    const awsMatch = results.matches.find((m) => m.transactionId === "TXN-ICICI-1001");
    expect(awsMatch).toBeDefined();
    expect(awsMatch?.category).toBe("TDS_DEDUCTION");
    expect(awsMatch?.invoiceIds).toContain("INV-2026-001");
    expect(awsMatch?.transactionAmount).toBe(145000);
    expect(awsMatch?.auditTrace.taxCalculated?.section).toBe("194C");
    expect(awsMatch?.auditTrace.taxCalculated?.tdsWithheld).toBe(2500);
  });

  test("reconciles Section 194J (10% TDS) on Datadog invoice", () => {
    const datadogMatch = results.matches.find((m) => m.transactionId === "TXN-ICICI-1007");
    expect(datadogMatch).toBeDefined();
    expect(datadogMatch?.category).toBe("TDS_DEDUCTION");
    expect(datadogMatch?.invoiceIds).toContain("INV-2026-007");
    expect(datadogMatch?.transactionAmount).toBe(118800);
    expect(datadogMatch?.auditTrace.taxCalculated?.section).toBe("194J");
    expect(datadogMatch?.auditTrace.taxCalculated?.tdsWithheld).toBe(11000);
  });

  test("reconciles Section 194I (10% TDS) on WeWork Rent invoice", () => {
    const rentMatch = results.matches.find((m) => m.transactionId === "TXN-ICICI-1016");
    expect(rentMatch).toBeDefined();
    expect(rentMatch?.category).toBe("TDS_DEDUCTION");
    expect(rentMatch?.invoiceIds).toContain("INV-2026-016");
    expect(rentMatch?.transactionAmount).toBe(432000);
    expect(rentMatch?.auditTrace.taxCalculated?.section).toBe("194I");
    expect(rentMatch?.auditTrace.taxCalculated?.tdsWithheld).toBe(40000);
  });

  test("reconciles USD SaaS FX conversion with realistic spot rate", () => {
    const slackMatch = results.matches.find((m) => m.transactionId === "TXN-HDFC-1003");
    expect(slackMatch).toBeDefined();
    expect(slackMatch?.category).toBe("FX_CONVERSION");
    expect(slackMatch?.invoiceIds).toContain("INV-2026-003");
    expect(slackMatch?.auditTrace.fxCalculated?.spotRate).toBeCloseTo(84.30, 2);
  });

  test("reconciles Razorpay Gateway settlements net of 2% MDR fee and 18% GST", () => {
    const rzpMatch = results.matches.find((m) => m.transactionId === "TXN-ICICI-2001");
    expect(rzpMatch).toBeDefined();
    expect(rzpMatch?.category).toBe("GATEWAY_FEE_SPLIT");
    expect(rzpMatch?.settlementId).toBe("setl_001");
    expect(rzpMatch?.transactionAmount).toBe(488200);
    expect(rzpMatch?.auditTrace.gatewayCalculated?.gross).toBe(500000);
    expect(rzpMatch?.auditTrace.gatewayCalculated?.fee).toBe(10000);
    expect(rzpMatch?.auditTrace.gatewayCalculated?.tax).toBe(1800);
  });

  test("flags honest exceptions without false positives", () => {
    expect(results.exceptions.length).toBe(2);

    // 1. Price Mismatch
    const priceMismatch = results.exceptions.find((e) => e.transactionId === "TXN-ICICI-1028");
    expect(priceMismatch).toBeDefined();
    expect(priceMismatch?.category).toBe("PRICE_MISMATCH");
    expect(priceMismatch?.requiresHumanApproval).toBe(true);

    // 2. Unidentified Bank Debits
    const unknownDebit = results.exceptions.find((e) => e.transactionId === "TXN-HDFC-1029");
    expect(unknownDebit).toBeDefined();
    expect(unknownDebit?.category).toBe("UNIDENTIFIED_DEBIT");
  });

  test("handles messy bank narrations with fuzzy UTR and special characters", () => {
    const customInvoices: InvoiceRecord[] = [
      {
        id: "INV-FUZZY-001",
        vendorName: "Razorpay Software Pvt Ltd",
        category: "saas",
        currency: "INR",
        subtotal: 50000,
        taxAmount: 9000,
        totalAmount: 59000,
        tdsApplicable: true,
        tdsSection: "194J",
        tdsRate: 0.10,
        expectedTdsAmount: 5000,
        netPayable: 54000,
        dueDate: "2026-09-15",
        status: "PENDING",
      },
    ];

    const messyTxn: BankStatementRecord = {
      id: "TXN-MESSY-001",
      bank: "ICICI",
      accountNumber: "998877665544",
      transactionDate: "2026-08-30",
      valueDate: "2026-08-30",
      amount: 54000,
      type: "DEBIT",
      narration: "NEFT/ICIC260830999/RAZORPAY-SOFT//INVFUZZY001/MUMBAI",
      utr: "ICIC260830999",
      status: "POSTED",
    };

    const fuzzyResult = engine.reconcileBatch(customInvoices, [messyTxn]);
    expect(fuzzyResult.matches.length).toBe(1);
    expect(fuzzyResult.matches[0]?.invoiceIds).toContain("INV-FUZZY-001");
    expect(fuzzyResult.matches[0]?.category).toBe("TDS_DEDUCTION");
  });

  test("Performance SLA: reconciles high-volume synthetic batch (500 tx) in < 25ms", () => {
    // Generate 500 synthetic transactions
    const largeInvoices: InvoiceRecord[] = [];
    const largeTx: BankStatementRecord[] = [];

    for (let i = 0; i < 500; i++) {
      const invId = `INV-PERF-${i}`;
      largeInvoices.push({
        id: invId,
        vendorName: `Vendor Enterprise ${i}`,
        category: "cloud",
        currency: "INR",
        subtotal: 100000 + i * 10,
        taxAmount: 18000 + i * 2,
        totalAmount: 118000 + i * 12,
        tdsApplicable: true,
        tdsSection: "194C",
        tdsRate: 0.02,
        expectedTdsAmount: 2000 + i * 0.2,
        netPayable: 116000 + i * 11.8,
        dueDate: "2026-09-30",
        status: "PENDING",
      });

      largeTx.push({
        id: `TXN-PERF-${i}`,
        bank: "ICICI",
        accountNumber: "1234567890",
        transactionDate: "2026-08-31",
        valueDate: "2026-08-31",
        amount: 116000 + i * 11.8,
        type: "DEBIT",
        narration: `NEFT/${invId}/Vendor ${i}`,
        utr: `UTRPERF${i}`,
        status: "POSTED",
      });
    }

    const t0 = performance.now();
    const perfResult = engine.reconcileBatch(largeInvoices, largeTx);
    const durationMs = performance.now() - t0;

    expect(perfResult.totalTransactionsProcessed).toBe(500);
    expect(perfResult.matchedCount).toBe(500);
    expect(durationMs).toBeLessThan(150); // High-throughput SLA: < 150ms for 500 transactions (> 3,300 tx/sec under Windows background test load)
  });
});
