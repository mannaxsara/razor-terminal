/**
 * RazorTerminal — Treasury Forecast Plugin Definition
 */

import type { GloomPlugin } from "../../../types/plugin";
import { TreasuryForecastPane } from "./pane";

export const treasuryForecastPlugin: GloomPlugin = {
  id: "treasury-forecast",
  name: "Treasury Forecast",
  version: "1.0.0",
  description: "30-day working capital liquidity runway simulator and predictive cash collection forecaster.",
  toggleable: true,

  setup(ctx) {
    ctx.registerPane({
      id: "treasury-forecast",
      name: "Treasury Forecast",
      icon: "T",
      component: TreasuryForecastPane,
      defaultPosition: "right",
      defaultMode: "floating",
      defaultFloatingSize: { width: 100, height: 20 },
    });

    ctx.registerPaneTemplate({
      id: "treasury-forecast-pane",
      paneId: "treasury-forecast",
      label: "Treasury Runway Forecast",
      description: "Working capital liquidity and 30-day cash runway forecaster",
      keywords: ["treasury", "forecast", "runway", "cash", "liquidity", "working capital", "burn"],
      shortcut: { prefix: "CASH" },
    });

    ctx.registerCommand({
      id: "open-treasury-forecast",
      label: "Open Treasury Forecast",
      description: "Inspect 30-day cash flow simulations and runway telemetry",
      keywords: ["treasury", "forecast", "cash"],
      category: "data",
      shortcut: "CASH",
      async execute() {
        ctx.showPane("treasury-forecast");
      },
    });
  },

  dispose() {},
};
