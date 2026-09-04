import { describe, expect, test } from "bun:test";
import { getReconciledBatchData, getTreasuryState } from "./data";

describe("Web Dashboard Data Adapter", () => {
  test("returns 52 total transactions with 96.2% match rate and 2 exceptions", () => {
    const data = getReconciledBatchData();

    expect(data.kpis.totalTransactions).toBe(52);
    expect(data.kpis.autoMatchedCount).toBe(50);
    expect(data.kpis.exceptionCount).toBe(2);
    expect(data.kpis.precision).toBe(100);
    expect(data.kpis.matchRate).toBeGreaterThan(96.0);
    expect(data.matches.length).toBe(50);
    expect(data.exceptions.length).toBe(2);
  });

  test("correctly structures price mismatch anomaly with pre-filled dispute notice", () => {
    const data = getReconciledBatchData();
    const priceException = data.exceptions.find((e) => e.exceptionType === "PRICE_MISMATCH");

    expect(priceException).toBeDefined();
    expect(priceException?.debitedAmount).toBe(284000);
    expect(priceException?.invoicedAmount).toBe(324000);
    expect(priceException?.varianceAmount).toBe(40000);
    expect(priceException?.disputeDraft?.recipient).toContain("@");
    expect(priceException?.disputeDraft?.body).toContain("Overcharge Variance");
  });

  test("correctly structures unlinked bank debit anomaly with procurement inquiry draft", () => {
    const data = getReconciledBatchData();
    const unlinkedException = data.exceptions.find((e) => e.exceptionType === "UNLINKED_INVOICE");

    expect(unlinkedException).toBeDefined();
    expect(unlinkedException?.debitedAmount).toBe(48500);
    expect(unlinkedException?.invoicedAmount).toBe(0);
    expect(unlinkedException?.varianceAmount).toBe(48500);
    expect(unlinkedException?.disputeDraft?.recipient).toContain("procurement");
    expect(unlinkedException?.disputeDraft?.subject).toContain("Missing AP Invoice");
    expect(unlinkedException?.disputeDraft?.body).toContain("no corresponding invoice in Accounts Payable");
  });

  test("covers all 5 reconciliation categories across 50 matched records", () => {
    const data = getReconciledBatchData();
    const categories = new Set(data.matches.map((m) => m.category));

    expect(categories.has("DIRECT_100_MATCH")).toBe(true);
    expect(categories.has("TDS_DEDUCTION")).toBe(true);
    expect(categories.has("FX_CONVERSION")).toBe(true);
    expect(categories.has("GATEWAY_FEE_SPLIT")).toBe(true);
    expect(categories.has("SPLIT_PAYMENT") || categories.has("BULK_PAYMENT")).toBe(true);
  });

  test("calculates positive treasury balance and forward runway curve", () => {
    const treasury = getTreasuryState();

    expect(treasury.totalLiquidCash).toBeGreaterThan(80000000);
    expect(treasury.dailyBurnRate).toBeGreaterThan(0);
    expect(treasury.projectedRunwayDays).toBeGreaterThan(60);
    expect(treasury.runwayCurve.length).toBe(30);
    expect(treasury.runwayCurve[0]?.day).toBe(1);
  });
});
