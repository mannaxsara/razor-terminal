/**
 * RazorTerminal — Reconciliation Plugin Definition
 */

import type { GloomPlugin } from "../../../types/plugin";
import { ReconciliationPane } from "./pane";

export const reconciliationPlugin: GloomPlugin = {
  id: "reconciliation",
  name: "Reconciliation Workstation",
  version: "1.0.0",
  description: "Autonomous 3-way multi-source matching engine for Razorpay payouts, bank feeds, and AP invoices.",
  toggleable: true,

  setup(ctx) {
    ctx.registerPane({
      id: "reconciliation",
      name: "Reconciliation",
      icon: "⚡",
      component: ReconciliationPane,
      defaultPosition: "right",
      defaultMode: "floating",
      defaultFloatingSize: { width: 96, height: 28 },
    });

    ctx.registerPaneTemplate({
      id: "reconciliation-pane",
      paneId: "reconciliation",
      label: "Reconciliation Workstation",
      description: "Autonomous multi-source reconciliation matching engine",
      keywords: ["reconciliation", "recon", "matching", "invoice", "bank", "settlement", "tds", "gst", "razorpay"],
      shortcut: { prefix: "REC" },
    });

    ctx.registerCommand({
      id: "run-reconciliation-batch",
      label: "Run Reconciliation Batch",
      description: "Execute 7-stage autonomous reconciliation across open invoices and bank transactions",
      keywords: ["reconcile", "batch", "matching"],
      category: "data",
      shortcut: "REC",
      async execute() {
        ctx.showPane("reconciliation");
      },
    });
  },

  dispose() {},
};
