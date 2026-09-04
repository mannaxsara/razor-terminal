/**
 * RazorTerminal — Bank Feeds Plugin Definition
 */

import type { GloomPlugin } from "../../../types/plugin";
import { BankFeedsPane } from "./pane";

export const bankFeedsPlugin: GloomPlugin = {
  id: "bank-feeds",
  name: "Bank Feeds",
  version: "1.0.0",
  description: "Corporate bank statement feeds (ICICI, HDFC, RazorpayX PG) with UTR indexing and real-time ledger sync.",
  toggleable: true,

  setup(ctx) {
    ctx.registerPane({
      id: "bank-feeds",
      name: "Bank Feeds",
      icon: "🏦",
      component: BankFeedsPane,
      defaultPosition: "left",
      defaultMode: "floating",
      defaultFloatingSize: { width: 88, height: 26 },
    });

    ctx.registerPaneTemplate({
      id: "bank-feeds-pane",
      paneId: "bank-feeds",
      label: "Bank Feeds",
      description: "Corporate bank statement stream",
      keywords: ["bank", "feeds", "statement", "debit", "credit", "icici", "hdfc", "razorpay"],
      shortcut: { prefix: "BANK" },
    });

    ctx.registerCommand({
      id: "open-bank-feeds",
      label: "Open Bank Feeds",
      description: "Inspect multi-bank statement transactions",
      keywords: ["bank", "feeds", "transactions"],
      category: "data",
      shortcut: "BANK",
      async execute() {
        ctx.showPane("bank-feeds");
      },
    });
  },

  dispose() {},
};
