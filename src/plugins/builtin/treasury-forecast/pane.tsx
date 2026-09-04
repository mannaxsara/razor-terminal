/**
 * RazorTerminal — Treasury 30-Day Runway & Liquidity Forecast Pane
 */

import { usePaneFooter } from "../../../components";
import { colors } from "../../../theme/colors";
import { Box, Text } from "../../../ui";
import type { PaneProps } from "../../../types/plugin";

export function TreasuryForecastPane({ width, height }: PaneProps) {
  // Key Metrics
  const currentCashINR = 14800000; // ₹1.48 Cr
  const monthlyBurnINR = 804000;   // ₹8.04 Lakhs/mo
  const runwayMonths = (currentCashINR / monthlyBurnINR).toFixed(1); // 18.4 months
  const projected30DInflow = 3500000;
  const projected30DOutflow = 2200000;
  const projectedNetDelta = projected30DInflow - projected30DOutflow;

  usePaneFooter("treasury-forecast", () => ({
    info: [
      {
        id: "treasury-kpi",
        parts: [
          { text: `Net Runway: ${runwayMonths} Months`, tone: "positive" },
          { text: " │ ", tone: "muted" },
          { text: `Liquidity: ₹${(currentCashINR / 10000000).toFixed(2)} Cr`, tone: "positive" },
          { text: " │ ", tone: "muted" },
          { text: `Projected 30D Cash Delta: +₹${(projectedNetDelta / 100000).toFixed(1)}L`, tone: "positive" },
        ],
      },
    ],
  }), [runwayMonths, currentCashINR, projectedNetDelta]);

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.bg}>
      {/* Top Banner */}
      <Box paddingX={1} paddingY={0} backgroundColor={colors.panel} borderBottomColor={colors.border}>
        <Text color={colors.headerText}>📈 TREASURY LIQUIDITY & 30-DAY CASH RUNWAY FORECAST</Text>
      </Box>

      {/* 4 Summary Cards */}
      <Box flexDirection="row" padding={1} gap={2}>
        {/* Card 1: Total Liquidity */}
        <Box flexDirection="column" paddingX={2} paddingY={1} backgroundColor={colors.panel} borderColor={colors.border}>
          <Text color={colors.textDim}>TOTAL CASH & EQUIVALENTS</Text>
          <Text color={colors.positive}>₹{(currentCashINR / 10000000).toFixed(2)} Crores</Text>
          <Text color={colors.textDim}>ICICI + HDFC Corporate</Text>
        </Box>

        {/* Card 2: Net Runway */}
        <Box flexDirection="column" paddingX={2} paddingY={1} backgroundColor={colors.panel} borderColor={colors.border}>
          <Text color={colors.textDim}>ESTIMATED CASH RUNWAY</Text>
          <Text color={colors.positive}>{runwayMonths} Months</Text>
          <Text color={colors.textDim}>Burn: ₹{(monthlyBurnINR / 100000).toFixed(1)}L/mo</Text>
        </Box>

        {/* Card 3: 30D Projected Receivables */}
        <Box flexDirection="column" paddingX={2} paddingY={1} backgroundColor={colors.panel} borderColor={colors.border}>
          <Text color={colors.textDim}>30D INFLOWS (PG SETTLEMENTS)</Text>
          <Text color={colors.headerText}>+₹{(projected30DInflow / 100000).toFixed(1)} Lakhs</Text>
          <Text color={colors.textDim}>RazorpayX Settlements</Text>
        </Box>

        {/* Card 4: 30D Projected Payables */}
        <Box flexDirection="column" paddingX={2} paddingY={1} backgroundColor={colors.panel} borderColor={colors.border}>
          <Text color={colors.textDim}>30D OUTFLOWS (AP INVOICES)</Text>
          <Text color={colors.warning}>-₹{(projected30DOutflow / 100000).toFixed(1)} Lakhs</Text>
          <Text color={colors.textDim}>Vendor Cloud & Rent</Text>
        </Box>
      </Box>

      {/* Runway Progress Meter */}
      <Box paddingX={1} flexDirection="column">
        <Box flexDirection="row">
          <Text color={colors.textDim}>LIQUIDITY BUFFER HEALTH: </Text>
          <Text color={colors.positive}>████████████████████████████████████████████ </Text>
          <Text color={colors.textBright}>18.4 Mos (Target: &gt; 12 Mos)</Text>
        </Box>
      </Box>
    </Box>
  );
}
