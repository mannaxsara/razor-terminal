/**
 * RazorTerminal — Invoices Ledger Plugin Definition
 */

import type { GloomPlugin } from "../../../types/plugin";
import { InvoicesLedgerPane } from "./pane";

export const invoicesLedgerPlugin: GloomPlugin = {
  id: "invoices-ledger",
  name: "Invoices Ledger (AP)",
  version: "1.0.0",
  description: "Accounts Payable (AP) invoice ledger with tax deductions, vendor GST/PAN tags, and due dates.",
  toggleable: true,

  setup(ctx) {
    ctx.registerPane({
      id: "invoices-ledger",
      name: "Invoices Ledger",
      icon: "📄",
      component: InvoicesLedgerPane,
      defaultPosition: "left",
      defaultMode: "floating",
      defaultFloatingSize: { width: 88, height: 26 },
    });

    ctx.registerPaneTemplate({
      id: "invoices-ledger-pane",
      paneId: "invoices-ledger",
      label: "Invoices Ledger (AP)",
      description: "Accounts Payable vendor invoices",
      keywords: ["invoices", "ap", "bills", "vendors", "ledger", "accounts payable", "tax"],
      shortcut: { prefix: "AP" },
    });

    ctx.registerCommand({
      id: "open-invoices-ledger",
      label: "Open Invoices Ledger",
      description: "Inspect vendor invoices and Accounts Payable",
      keywords: ["invoices", "ap", "payables", "bills"],
      category: "data",
      shortcut: "AP",
      async execute() {
        ctx.showPane("invoices-ledger");
      },
    });
  },

  dispose() {},
};
