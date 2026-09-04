/**
 * RazorTerminal — AI Exception Queue Plugin Definition
 */

import type { GloomPlugin } from "../../../types/plugin";
import { ExceptionQueuePane } from "./pane";

export const exceptionQueuePlugin: GloomPlugin = {
  id: "exception-queue",
  name: "Exception Queue",
  version: "1.0.0",
  description: "AI Anomaly Diagnosis & Human-in-the-Loop approval gate for pricing discrepancies and mystery debits.",
  toggleable: true,

  setup(ctx) {
    ctx.registerPane({
      id: "exception-queue",
      name: "Exception Queue",
      icon: "🚨",
      component: ExceptionQueuePane,
      defaultPosition: "right",
      defaultMode: "floating",
      defaultFloatingSize: { width: 88, height: 20 },
    });

    ctx.registerPaneTemplate({
      id: "exception-queue-pane",
      paneId: "exception-queue",
      label: "AI Exception Queue",
      description: "Review and resolve flagged financial discrepancies",
      keywords: ["exception", "anomaly", "discrepancy", "fraud", "review", "audit", "cfo"],
      shortcut: { prefix: "EXC" },
    });

    ctx.registerCommand({
      id: "open-exception-queue",
      label: "Open Exception Queue",
      description: "Review unresolvable bank debits and pricing discrepancies",
      keywords: ["exception", "queue", "dispute", "audit"],
      category: "data",
      shortcut: "EXC",
      async execute() {
        ctx.showPane("exception-queue");
      },
    });
  },

  dispose() {},
};
