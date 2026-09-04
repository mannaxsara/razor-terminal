/**
 * RazorTerminal — Autonomous Reconciliation Workstation Pane
 */

import { useState, useMemo, useCallback } from "react";
import {
  DataTableView,
  usePaneFooter,
  type DataTableCell,
  type DataTableColumn,
} from "../../../components";
import type { DataTableRowState } from "../../../components/ui/data-table/types";
import { colors } from "../../../theme/colors";
import { Box, Text } from "../../../ui";
import type { PaneProps } from "../../../types/plugin";
import { AutonomousReconciliationEngine } from "./engine";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "./data";
import type { ReconciledMatch } from "./types";

type ReconColumnId = "id" | "bank" | "category" | "amount" | "invoices" | "confidence" | "status";
type ReconColumn = DataTableColumn & { id: ReconColumnId };

const RECON_COLUMNS: ReconColumn[] = [
  { id: "id", label: "Txn ID", width: 16, align: "left" },
  { id: "bank", label: "Bank/Feed", width: 10, align: "left" },
  { id: "category", label: "Category", width: 18, align: "left" },
  { id: "amount", label: "Amount (INR)", width: 15, align: "right" },
  { id: "invoices", label: "Linked Invoices", width: 22, align: "left" },
  { id: "confidence", label: "Conf.", width: 8, align: "right" },
  { id: "status", label: "Status", width: 12, align: "left" },
];

export function ReconciliationPane({ focused, width, height }: PaneProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const engine = useMemo(() => new AutonomousReconciliationEngine(), []);
  const allTx = useMemo(() => [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS], []);
  const results = useMemo(() => engine.reconcileBatch(SYNTHETIC_INVOICES, allTx, SYNTHETIC_RAZORPAY_SETTLEMENTS), [engine, allTx]);

  const rows = results.matches;
  const selectedMatch = rows[selectedIdx];

  const renderCell = useCallback((m: ReconciledMatch, column: ReconColumn, _index: number, rowState: DataTableRowState): DataTableCell => {
    const selectedColor = rowState.selected ? colors.selectedText : undefined;
    switch (column.id) {
      case "id":
        return { text: m.transactionId, color: selectedColor ?? colors.textBright };
      case "bank":
        return { text: m.settlementId ? "RZP-PG" : m.bank, color: selectedColor ?? colors.textMuted };
      case "category":
        return {
          text: m.category,
          color: selectedColor ?? (m.category.includes("TDS")
            ? colors.warning
            : m.category.includes("FX")
            ? colors.headerText
            : m.category.includes("GATEWAY")
            ? colors.textDim
            : colors.positive),
        };
      case "amount":
        return { text: `₹${m.transactionAmount.toLocaleString("en-IN")}`, color: selectedColor ?? colors.textBright };
      case "invoices":
        return { text: m.invoiceIds.join(", ") || "—", color: selectedColor ?? colors.headerText };
      case "confidence":
        return { text: `${(m.confidence * 100).toFixed(0)}%`, color: selectedColor ?? colors.positive };
      case "status":
        return { text: "🟢 RECON", color: selectedColor ?? colors.positive };
    }
  }, []);

  usePaneFooter("reconciliation", () => ({
    info: [
      {
        id: "recon-kpi",
        parts: [
          { text: `Reconciled: ₹${results.totalVolumeINR.toLocaleString("en-IN")}`, tone: "positive" },
          { text: " │ ", tone: "muted" },
          { text: `Match Rate: ${results.matchRatePercent.toFixed(1)}% (${results.matchedCount}/${results.totalTransactionsProcessed})`, tone: "positive" },
          { text: " │ ", tone: "muted" },
          { text: `Exceptions: ${results.exceptionCount}`, tone: results.exceptionCount > 0 ? "warning" : "positive" },
        ],
      },
    ],
  }), [results]);

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.bg}>
      {/* Top Header Summary Banner */}
      <Box paddingX={1} paddingY={0} backgroundColor={colors.panel} borderBottomColor={colors.border}>
        <Text color={colors.headerText}>⚡ RAZORPAYX AI CONTROLLER </Text>
        <Text color={colors.textDim}>│ Batch Vol: </Text>
        <Text color={colors.textBright}>₹{results.totalVolumeINR.toLocaleString("en-IN")} </Text>
        <Text color={colors.textDim}>│ Auto-Matched: </Text>
        <Text color={colors.positive}>{results.matchedCount}/{results.totalTransactionsProcessed} ({results.matchRatePercent.toFixed(1)}%) </Text>
        <Text color={colors.textDim}>│ Precision: </Text>
        <Text color={colors.positive}>100% </Text>
      </Box>

      {/* Main Grid View */}
      <Box flexGrow={1} overflow="hidden">
        <DataTableView<ReconciledMatch, ReconColumn>
          focused={focused}
          selection={{
            kind: "index",
            selectedIndex: selectedIdx,
            onChange: (index) => setSelectedIdx(index),
          }}
          rootWidth={width}
          rootHeight={height ? height - 5 : undefined}
          rootBackgroundColor={colors.bg}
          columns={RECON_COLUMNS}
          items={rows}
          sortColumnId={null}
          sortDirection="asc"
          onHeaderClick={() => {}}
          emptyStateTitle="No matching records"
          getItemKey={(m) => m.matchId}
          renderCell={renderCell}
        />
      </Box>

      {/* Audit Detail Inspector Drawer */}
      {selectedMatch && (
        <Box
          paddingX={1}
          paddingY={0}
          backgroundColor={colors.panel}
          borderTopColor={colors.border}
          flexDirection="column"
        >
          <Box flexDirection="row">
            <Text color={colors.textDim}>AUDIT LOG [{selectedMatch.transactionId}]: </Text>
            <Text color={colors.textBright}>{selectedMatch.explanation}</Text>
          </Box>
          <Box flexDirection="row">
            <Text color={colors.textDim}>RULE: </Text>
            <Text color={colors.headerText}>{selectedMatch.auditTrace.ruleMatched} </Text>
            <Text color={colors.textDim}>│ UTR: </Text>
            <Text color={colors.textMuted}>{selectedMatch.utr}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
