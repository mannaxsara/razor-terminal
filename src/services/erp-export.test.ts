import { describe, it, expect } from "bun:test";
import { ErpJournalGenerator } from "./erp-export";

describe("ErpJournalGenerator (Indian GAAP Double-Entry)", () => {
  const generator = new ErpJournalGenerator();

  it("should generate balanced double-entry vouchers for all matched transactions", () => {
    const summary = generator.generateVouchers();
    expect(summary.totalVouchers).toBeGreaterThan(40);
    expect(summary.allBalanced).toBe(true);

    for (const v of summary.vouchers) {
      expect(v.isBalanced).toBe(true);
      expect(Math.abs(v.totalDebitINR - v.totalCreditINR)).toBeLessThanOrEqual(0.01);
      expect(v.lineItems.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should balance vendor payments with TDS (§194C, §194J, §194I)", () => {
    const summary = generator.generateVouchers();
    const vendorVouchers = summary.vouchers.filter((v) => v.voucherType === "PAYMENT");
    expect(vendorVouchers.length).toBeGreaterThan(20);

    for (const v of vendorVouchers) {
      const expenseLine = v.lineItems.find((l) => l.accountType === "EXPENSE");
      const bankLine = v.lineItems.find((l) => l.accountType === "BANK");
      const tdsLine = v.lineItems.find((l) => l.accountType === "LIABILITY");

      expect(expenseLine).toBeDefined();
      expect(bankLine).toBeDefined();
      expect(expenseLine!.debitINR).toBeGreaterThan(0);
      expect(bankLine!.creditINR).toBeGreaterThan(0);

      if (tdsLine) {
        expect(tdsLine.creditINR).toBeGreaterThan(0);
        expect(
          Math.abs(expenseLine!.debitINR - (bankLine!.creditINR + tdsLine.creditINR))
        ).toBeLessThanOrEqual(0.01);
      } else {
        expect(
          Math.abs(expenseLine!.debitINR - bankLine!.creditINR)
        ).toBeLessThanOrEqual(0.01);
      }
    }
  });

  it("should balance gateway settlements with MDR and GST", () => {
    const summary = generator.generateVouchers();
    const settlementVouchers = summary.vouchers.filter((v) => v.voucherType === "RECEIPT");
    expect(settlementVouchers.length).toBeGreaterThanOrEqual(5);

    for (const v of settlementVouchers) {
      const bankLine = v.lineItems.find((l) => l.accountType === "BANK");
      const arLine = v.lineItems.find((l) => l.accountType === "REVENUE");

      expect(bankLine).toBeDefined();
      expect(arLine).toBeDefined();
      expect(bankLine!.debitINR).toBeGreaterThan(0);
      expect(arLine!.creditINR).toBeGreaterThan(0);

      const totalDebits = v.lineItems.reduce((s, l) => s + l.debitINR, 0);
      const totalCredits = v.lineItems.reduce((s, l) => s + l.creditINR, 0);
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01);
    }
  });

  it("should export audit summary with 100% balanced vouchers", () => {
    const summary = generator.generateVouchers();
    expect(summary.allBalanced).toBe(true);
    expect(summary.totalVolumeINR).toBeGreaterThan(1_000_000);
    expect(summary.totalTdsWithheldINR).toBeGreaterThan(0);
    expect(summary.totalGatewayFeesINR).toBeGreaterThan(0);
  });

  it("should export valid Zoho Books CSV formatted output", () => {
    const csv = generator.toZohoBooksCsv();
    expect(csv).toContain("Voucher Number,Date,Voucher Type,Account Name,Account Code,Debit (INR),Credit (INR),Narration,Banking UTR,Reference ID");
    const lines = csv.split("\n").filter(Boolean);
    expect(lines.length).toBeGreaterThan(100);
  });
});
