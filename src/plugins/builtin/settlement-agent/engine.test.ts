/**
 * RazorTerminal — Settlement Q&A Agent Engine Unit Tests
 */

import { describe, expect, test } from "bun:test";
import { SettlementAgentEngine } from "./engine";

describe("SettlementAgentEngine", () => {
  const agent = new SettlementAgentEngine();

  test("answers settlement variance breakdown for setl_003", () => {
    const res = agent.answerQuery("Why was Razorpay settlement #setl_003 ₹8,024 less than the gross invoice amount?");
    expect(res.intent).toBe("SETTLEMENT_EXPLANATION");
    expect(res.calculatedMetrics?.feeAmount).toBe(6800);
    expect(res.calculatedMetrics?.taxAmount).toBe(1224);
    expect(res.calculatedMetrics?.grossAmount).toBe(340000);
    expect(res.calculatedMetrics?.netAmount).toBe(331976);
    expect(res.summaryText).toContain("MDR Fee (2.00%) and GST (18.00% on fee)");
  });

  test("calculates statutory TDS breakdown across sections 194C, 194J, and 194I", () => {
    const res = agent.answerQuery("Show total Section 194J and Section 194C TDS withheld this month.");
    expect(res.intent).toBe("TDS_BREAKDOWN");
    expect(res.calculatedMetrics?.totalTdsWithheld).toBeGreaterThan(150000);
    expect(res.breakdownLines.some((l) => l.includes("194C"))).toBe(true);
    expect(res.breakdownLines.some((l) => l.includes("194J"))).toBe(true);
    expect(res.breakdownLines.some((l) => l.includes("194I"))).toBe(true);
  });

  test("simulates working capital runway impact for simulated outflow shock", () => {
    const res = agent.answerQuery("What happens to our 30-day treasury runway if AWS charges ₹2,00,000 next Monday?");
    expect(res.intent).toBe("RUNWAY_SIMULATION");
    expect(res.calculatedMetrics?.projectedRunwayDays).toBeDefined();
    expect(res.calculatedMetrics?.projectedRunwayDays).toBeGreaterThan(100);
    expect(res.summaryText).toContain("Simulating debit of ₹2,00,000");
  });

  test("generates formal audit-ready vendor dispute letter for overbilled invoices", () => {
    const res = agent.answerQuery("Draft a formal dispute notice for overbilled invoice INV-2026-036 (discrepancy ₹40,000).");
    expect(res.intent).toBe("DISPUTE_DRAFT");
    expect(res.disputeDraft).toBeDefined();
    expect(res.disputeDraft?.invoiceId).toBe("INV-2026-036");
    expect(res.disputeDraft?.discrepancyAmount).toBe(40000);
    expect(res.disputeDraft?.formattedLetter).toContain("Formal Discrepancy Notice — Invoice #INV-2026-036");
    expect(res.disputeDraft?.formattedLetter).toContain("₹3,24,000 INR");
    expect(res.disputeDraft?.formattedLetter).toContain("₹2,84,000 INR");
  });

  test("returns general ledger overview for generic financial questions", () => {
    const res = agent.answerQuery("What is our current financial reconciliation status?");
    expect(res.intent).toBe("GENERAL_FINANCE");
    expect(res.breakdownLines.some((l) => l.includes("96.2%"))).toBe(true);
  });
});
