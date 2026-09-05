import { describe, it, expect } from "bun:test";
import { generateRazorpayxPayoutPayload } from "./razorpayx-payout";

describe("RazorpayX Payout Generator", () => {
  it("should generate a valid POST /v1/payouts payload with correct paise conversion", () => {
    const payload = generateRazorpayxPayoutPayload({
      vendorName: "Overpriced Cloud Consultants",
      referenceId: "INV-2026-036",
      amountINR: 40000,
      narration: "Refund of Overcharge INV-036",
    });

    expect(payload.account_number).toBe("2323230078901234");
    expect(payload.amount).toBe(4000000); // 40,000 * 100 paise
    expect(payload.currency).toBe("INR");
    expect(payload.mode).toBe("NEFT");
    expect(payload.fund_account.account_type).toBe("bank_account");
    expect(payload.fund_account.bank_account?.name).toBe("Overpriced Cloud Consultants");
    expect(payload.notes.source).toBe("RazorTerminal-AI-Controller");
  });

  it("should select RTGS for high value payments (> 2,00,000 INR)", () => {
    const payload = generateRazorpayxPayoutPayload({
      vendorName: "Amazon Web Services India",
      referenceId: "AWS-INV-9981",
      amountINR: 520000,
    });

    expect(payload.mode).toBe("RTGS");
    expect(payload.amount).toBe(52000000);
  });
});
