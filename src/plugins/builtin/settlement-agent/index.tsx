/**
 * RazorTerminal — Settlement Q&A & Dispute Resolution Agent Plugin
 */

import type { GloomPlugin } from "../../../types/plugin";
import { SettlementAgentPane } from "./pane";

export const settlementAgentPlugin: GloomPlugin = {
  id: "settlement-agent",
  name: "Settlement Q&A Agent",
  version: "1.0.0",
  description: "Interactive AI agent for payment gateway settlement audits, statutory TDS breakdowns, runway stress-testing, and vendor dispute drafting.",
  toggleable: true,

  setup(ctx) {
    ctx.registerPane({
      id: "settlement-agent",
      name: "Settlement Q&A Agent",
      icon: "S",
      component: SettlementAgentPane,
      defaultPosition: "right",
      defaultMode: "floating",
      defaultFloatingSize: { width: 96, height: 28 },
    });

    ctx.registerPaneTemplate({
      id: "settlement-agent-pane",
      paneId: "settlement-agent",
      label: "Settlement Q&A Agent",
      description: "Interactive AI agent for settlement variances, TDS analysis, runway simulation, and vendor dispute drafts",
      keywords: ["qa", "agent", "settlement", "dispute", "tds", "runway", "ai", "razorpay", "variance"],
      shortcut: { prefix: "QA" },
    });

    ctx.registerCommand({
      id: "open-settlement-qa-agent",
      label: "Open Settlement Q&A Agent",
      description: "Launch interactive conversational agent for settlement analysis and dispute drafting",
      keywords: ["qa", "agent", "settlement", "dispute"],
      category: "data",
      shortcut: "QA",
      async execute() {
        ctx.showPane("settlement-agent");
      },
    });
  },

  dispose() {},
};
